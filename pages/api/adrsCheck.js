import { connectDB } from "@/util/database"

export default async function handler(req, res){
    if (req.method == "GET"){
        const db = (await connectDB).db("dapp-test")
        const result = await db.collection('wallets').find({ adrs: req.query.adrs }).toArray();
        if (result[0]) {
            return res.status(200).json({reward:result[0].reward, taken:result[0].taken})
        }else{
            if (!req.query.ref){
                req.query.ref = "master"
            }
            const result = await db.collection('wallets').insertOne({
                 adrs: req.query.adrs,
                 ref: req.query.ref,
                 reward:0,
                 taken:0,
                 net : "eth",
                 createdAt: new Date()
            });
            
            return res.status(200).json({msg:"Bad"})
        }
        
        
    }
    
}