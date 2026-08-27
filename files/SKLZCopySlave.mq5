//+------------------------------------------------------------------+
//| SKLZ LABS COPY — Slave EA v1                                     |
//| Your credentials never leave your terminal. This EA authenticates|
//| with a copy key, polls SKLZ for instructions, executes locally,  |
//| and reports every fill or failure back — nothing is silent.      |
//| Add https://api.sklzlabs.com to Tools > Options > Expert         |
//| Advisors > Allow WebRequest before attaching.                    |
//+------------------------------------------------------------------+
#property copyright "SKLZ LABS"
#property version   "1.04"
#property strict

input string CopyKey       = "";        // your copy key from the dashboard
input string ApiBase       = "https://api.sklzlabs.com";
input double RiskPctCap    = 1.0;       // hard per-trade risk cap (risk_pct mode)
input double MaxLotCap     = 2.0;       // absolute lot ceiling, whatever SKLZ says
input int    PollSeconds   = 2;
input long   MagicNumber   = 77555001;

datetime g_lastPoll = 0;

int OnInit(){
   if(StringLen(CopyKey) < 20){
      Print("SKLZ COPY: set your CopyKey (dashboard > Copy > your account)");
      return INIT_PARAMETERS_INCORRECT;
   }
   EventSetTimer(PollSeconds);
   Print("SKLZ COPY slave active. Polling every ", PollSeconds, "s.");
   return INIT_SUCCEEDED;
}
void OnDeinit(const int r){ EventKillTimer(); }

string HttpGet(string url){
   char post[], result[]; string rh;
   ArrayResize(post, 0);
   int code = WebRequest("GET", url, "", 8000, post, result, rh);
   if(code != 200){
      Print("SKLZ COPY: poll HTTP ", code,
            code==-1 ? " (WebRequest blocked — check the URL allowance)" : "");
      return "";
   }
   return CharArrayToString(result);
}
void HttpPostJson(string url, string body){
   char post[], result[]; string rh;
   StringToCharArray(body, post, 0, -1, CP_UTF8);   // includes the NUL
   ArrayResize(post, ArraySize(post)-1);            // drop ONLY the NUL
   int code = WebRequest("POST", url, "Content-Type: application/json\r\n",
                         8000, post, result, rh);
   if(code != 200) Print("SKLZ COPY: report HTTP ", code);
}

// minimal JSON field readers (server sends flat, known-shape objects)
string JStr(string js, string key){
   int p = StringFind(js, "\""+key+"\"" ); if(p<0) return "";
   p = StringFind(js, ":", p) + 1;
   while(StringGetCharacter(js,p)==' ') p++;
   bool q = StringGetCharacter(js,p)=='"'; if(q) p++;
   int e = p;
   while(e<StringLen(js)){
      ushort c=StringGetCharacter(js,e);
      if(q && c=='"') break;
      if(!q && (c==','||c=='}'||c==']')) break;
      e++;
   }
   return StringSubstr(js, p, e-p);
}
double JNum(string js, string key){ string s=JStr(js,key); return StringToDouble(s); }

double ResolveLots(string mode, double lotVal, double srvLots,
                   string sym, double sl, int side){
   double lots = srvLots;                       // fixed/multiplier resolved server-side
   double bal  = AccountInfoDouble(ACCOUNT_BALANCE);
   double eq   = AccountInfoDouble(ACCOUNT_EQUITY);
   if(mode=="balance")      lots = NormalizeDouble(srvLots * bal / 10000.0, 2);
   else if(mode=="equity")  lots = NormalizeDouble(srvLots * eq  / 10000.0, 2);
   else if(mode=="risk_pct" && sl > 0){
      double px    = side>0 ? SymbolInfoDouble(sym, SYMBOL_ASK)
                            : SymbolInfoDouble(sym, SYMBOL_BID);
      double tick  = SymbolInfoDouble(sym, SYMBOL_TRADE_TICK_VALUE);
      double tsize = SymbolInfoDouble(sym, SYMBOL_TRADE_TICK_SIZE);
      double dist  = MathAbs(px - sl);
      double risk  = eq * MathMin(lotVal, RiskPctCap) / 100.0;
      if(dist>0 && tick>0 && tsize>0)
         lots = NormalizeDouble(risk / (dist / tsize * tick), 2);
   }
   double lmin = SymbolInfoDouble(sym, SYMBOL_VOLUME_MIN);
   double lmax = MathMin(SymbolInfoDouble(sym, SYMBOL_VOLUME_MAX), MaxLotCap);
   return MathMax(lmin, MathMin(lmax, lots));
}

int CloseByMasterTicket(long mticket){
   int closed = 0;
   for(int i = PositionsTotal()-1; i >= 0; i--){
      ulong pt = PositionGetTicket(i);
      if(!PositionSelectByTicket(pt)) continue;
      if(PositionGetInteger(POSITION_MAGIC) != MagicNumber) continue;
      string cm = PositionGetString(POSITION_COMMENT);
      if(StringFind(cm, "SKLZ#"+(string)mticket) < 0) continue;
      MqlTradeRequest rq; MqlTradeResult rs;
      ZeroMemory(rq); ZeroMemory(rs);
      rq.action   = TRADE_ACTION_DEAL;
      rq.position = pt;
      rq.symbol   = PositionGetString(POSITION_SYMBOL);
      rq.volume   = PositionGetDouble(POSITION_VOLUME);
      rq.type     = PositionGetInteger(POSITION_TYPE)==POSITION_TYPE_BUY
                    ? ORDER_TYPE_SELL : ORDER_TYPE_BUY;
      rq.deviation= 30; rq.magic = MagicNumber;
      long fm = SymbolInfoInteger(rq.symbol, SYMBOL_FILLING_MODE);
      if((fm & SYMBOL_FILLING_IOC) != 0)      rq.type_filling = ORDER_FILLING_IOC;
      else if((fm & SYMBOL_FILLING_FOK) != 0) rq.type_filling = ORDER_FILLING_FOK;
      else                                    rq.type_filling = ORDER_FILLING_RETURN;
      if(OrderSend(rq, rs) && rs.retcode == TRADE_RETCODE_DONE) closed++;
      else Print("SKLZ COPY: close attempt on ticket ", pt,
                 " retcode ", rs.retcode);
   }
   return closed;
}

void OnTimer(){
   string js = HttpGet(ApiBase + "/api/mt5copy/poll?key=" + CopyKey);
   if(js=="" || StringFind(js,"queue_id")<0) return;

   // split instruction objects
   int pos = 0;
   while(true){
      int a = StringFind(js, "{\"queue_id\"", pos); if(a<0) break;
      int b = StringFind(js, "}", a); if(b<0) break;
      string it = StringSubstr(js, a, b-a+1); pos = b+1;

      long   qid   = (long)JNum(it,"queue_id");
      string ev    = JStr(it,"event");
      long   mtk   = (long)JNum(it,"master_ticket");
      string sym   = JStr(it,"symbol");
      int    side  = (int)JNum(it,"side");
      double lots  = JNum(it,"lots");
      double sl    = JNum(it,"sl");
      double tp    = JNum(it,"tp");
      string mode  = JStr(it,"lot_mode");
      double lval  = JNum(it,"lot_value");
      double maxsp = JNum(it,"max_spread_pips");
      string live  = JStr(it,"live");

      ulong t0 = GetTickCount64();
      string st = "done", err = ""; long sticket = 0; double fpx = 0;

      Print("SKLZ COPY: instruction ", ev, " ", sym, " qid=", qid);

      // brokers dress the same instrument differently: XAUUSD.r, GOLDm, ...
      if(!SymbolSelect(sym, true)){
         string base = sym; string found = "";
         for(int si = 0; si < SymbolsTotal(false); si++){
            string cand = SymbolName(si, false);
            if(StringFind(cand, base) == 0){ found = cand; break; }
         }
         if(found != ""){
            Print("SKLZ COPY: ", sym, " resolved to broker symbol ", found);
            sym = found; SymbolSelect(sym, true);
         }
      }

      if(live!="true"){
         st="failed"; err="real-money copying disabled (flag)";
      } else if(ev=="close"){
         int n = CloseByMasterTicket(mtk);
         Print("SKLZ COPY: close matched ", n, " position(s) for SKLZ#", mtk);
         if(n == 0){
            // list what we DO hold, so a comment/ticket mismatch is visible
            for(int pi = 0; pi < PositionsTotal(); pi++){
               ulong pt2 = PositionGetTicket(pi);
               if(PositionSelectByTicket(pt2) &&
                  PositionGetInteger(POSITION_MAGIC) == MagicNumber)
                  Print("SKLZ COPY:   holding: ",
                        PositionGetString(POSITION_SYMBOL), " comment='",
                        PositionGetString(POSITION_COMMENT), "'");
            }
            st = "failed"; err = "no position matched SKLZ#" + (string)mtk;
         }
      } else if(ev=="open"){
         if(!SymbolSelect(sym, true)){ st="failed"; err="symbol not found: "+sym; }
         else{
            double spr = (SymbolInfoDouble(sym,SYMBOL_ASK)
                         -SymbolInfoDouble(sym,SYMBOL_BID))
                         / SymbolInfoDouble(sym,SYMBOL_POINT) / 10.0;
            if(maxsp>0 && spr>maxsp){ st="failed"; err="spread "+DoubleToString(spr,1)+" > cap"; }
            else{
               double vol = ResolveLots(mode, lval, lots, sym, sl, side);
               // retcode 10019 taught us: exotic brokers report exotic
               // tick values and the risk formula can size past the
               // account's margin. Ask the broker what the position
               // actually costs and shrink until it fits inside 80% of
               // free margin — a copier must never margin-call anyone.
               double px0 = side>0 ? SymbolInfoDouble(sym, SYMBOL_ASK)
                                   : SymbolInfoDouble(sym, SYMBOL_BID);
               double need = 0.0;
               double freeM = AccountInfoDouble(ACCOUNT_MARGIN_FREE);
               double lstep = SymbolInfoDouble(sym, SYMBOL_VOLUME_STEP);
               double lmin2 = SymbolInfoDouble(sym, SYMBOL_VOLUME_MIN);
               if(lstep <= 0) lstep = 0.01;
               for(int gu = 0; gu < 20; gu++){
                  if(!OrderCalcMargin(side>0?ORDER_TYPE_BUY:ORDER_TYPE_SELL,
                                      sym, vol, px0, need)) break;
                  if(need <= freeM * 0.8 || vol <= lmin2) break;
                  vol = MathMax(lmin2,
                                MathFloor(vol/2.0/lstep)*lstep);
               }
               Print("SKLZ COPY: sizing ", sym, " -> ", vol,
                     " lots (margin ", DoubleToString(need,2),
                     ", free ", DoubleToString(freeM,2), ")");
               MqlTradeRequest rq; MqlTradeResult rs;
               ZeroMemory(rq); ZeroMemory(rs);
               rq.action=TRADE_ACTION_DEAL; rq.symbol=sym; rq.volume=vol;
               rq.type = side>0 ? ORDER_TYPE_BUY : ORDER_TYPE_SELL;
               rq.sl=sl; rq.tp=tp; rq.deviation=30; rq.magic=MagicNumber;
               rq.comment="SKLZ#"+(string)mtk;
               // retcode 10030 taught us: never let the broker guess the
               // filling mode — ask the symbol which ones it accepts
               long fm = SymbolInfoInteger(sym, SYMBOL_FILLING_MODE);
               if((fm & SYMBOL_FILLING_IOC) != 0)      rq.type_filling = ORDER_FILLING_IOC;
               else if((fm & SYMBOL_FILLING_FOK) != 0) rq.type_filling = ORDER_FILLING_FOK;
               else                                    rq.type_filling = ORDER_FILLING_RETURN;
               if(!OrderSend(rq,rs) || rs.retcode!=TRADE_RETCODE_DONE){
                  st="failed"; err="retcode "+(string)rs.retcode;
               } else { sticket=(long)rs.order; fpx=rs.price; }
            }
         }
      }
      if(st=="done") Print("SKLZ COPY: ", ev, " ", sym, " OK",
                           sticket>0 ? " ticket "+(string)sticket : "");
      else Print("SKLZ COPY: ", ev, " ", sym, " FAILED — ", err);
      long ms = (long)(GetTickCount64()-t0);
      string body = "{\"queue_id\":"+(string)qid+",\"status\":\""+st+
                    "\",\"slave_ticket\":"+(string)sticket+
                    ",\"price\":"+DoubleToString(fpx,5)+
                    ",\"latency_ms\":"+(string)ms+
                    ",\"error\":\""+err+"\"}";
      HttpPostJson(ApiBase+"/api/mt5copy/report?key="+CopyKey, body);
   }
}
