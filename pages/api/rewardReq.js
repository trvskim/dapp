import { connectDB } from "@/util/database";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { amount, account } = req.body;
      console.log(req.body)
      // MongoDB 연결
      const db = (await connectDB).db("dapp-test");

      // 주소에 해당하는 지갑 정보 찾기
      const result = await db.collection("wallets").findOne({ adrs: account });

      if (!result) {
        return res.status(404).json({ message: "Wallet not found" });
      }

      // 출금 요청 금액이 리워드보다 클 경우 처리
      if (amount > result.reward) {
        return res.status(400).json({ message: "Insufficient reward" });
      }

      // 리워드 업데이트
      const newReward = result.reward - amount;
      const filter = { adrs: account }; // 지갑 주소 기준으로 검색
      const update = { $set: { reward: newReward } };

      const updateResult = await db.collection("wallets").updateOne(filter, update);
      const insertResult = await db.collection("req").insertOne({
        reqAdrs : account,
        reqType : "withdrawl",
        reqAmount : +amount,
        createdAt: new Date()
      });

      if (updateResult.modifiedCount === 1) {
        return res.status(200).json({ message: "Reward updated successfully", newReward });
      } else {
        return res.status(404).json({ message: "No document matched the query" });
      }
      
    } catch (error) {
      console.error("Error updating reward:", error);
      return res.status(500).json({ message: "Failed to update reward" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
