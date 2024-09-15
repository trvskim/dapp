import { connectDB } from "@/util/database";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const db = (await connectDB).db("dapp-test");
      const { adrs, ref } = req.query;

      if (!adrs) {
        return res.status(400).json({ error: "Address (adrs) is required" });
      }

      const result = await db.collection("wallets").findOne({ adrs });

      if (result) {
        // 지갑 정보가 존재하는 경우
        return res.status(200).json({ reward: result.reward, taken: result.taken });
      } else {
        // 지갑 정보가 없을 경우 새로 생성
        const newRef = ref || "master"; // ref가 없으면 기본값 "master" 사용
        const insertResult = await db.collection("wallets").insertOne({
          adrs,
          ref: newRef,
          reward: 0,
          taken: 0,
          net: "eth",
          createdAt: new Date(),
        });

        if (insertResult.acknowledged) {
          return res.status(201).json({ msg: "New wallet created" });
        } else {
          return res.status(500).json({ error: "Failed to create new wallet" });
        }
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
}
