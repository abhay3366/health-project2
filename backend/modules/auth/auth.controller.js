
const register=async(req,res)=>{
    try {
        const {name,email,password,coach}=req.body;
        const result=
    } catch (error) {
        res.status(400).json({error:error.message})
    }
}