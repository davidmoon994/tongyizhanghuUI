import express from "express";
import cors from "cors";

import exchangeRoutes from "./routes/exchange.js";
import accountRoutes from "./routes/account.js";
import orderRoutes from "./routes/order.js";

import { loginHandler } from "./auth.js";
import { syncBinanceTime, startMarkPriceWS } from "./binance.js";

/***********************
 * 创建 app（必须最先）
 ***********************/
const app = express();

/***********************
 * 中间件
 ***********************/
app.use(cors());
app.use(express.json());

/***********************
 * 健康检查（Render / 保活用）
 ***********************/
app.get("/health", (_, res) => {
  res.json({ ok: true, time: Date.now() });
});

/***********************
 * 公共接口
 ***********************/
app.get("/", (_, res) => {
  res.json({ ok: true });
});

app.post("/login", loginHandler);

/***********************
 * 需要登录的接口
 ***********************/
app.use("/exchange", exchangeRoutes);
app.use("/account", accountRoutes);
app.use("/order", orderRoutes);

/***********************
 * 启动
 ***********************/
const PORT = process.env.PORT || 3001;

(async () => {
  try {
    await syncBinanceTime();
    startMarkPriceWS();

    app.listen(PORT, () => {
      console.log(`🚀 Backend running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Backend start failed:", err);
    process.exit(1);
  }
})();

