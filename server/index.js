import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import fetch from 'node-fetch'
import {createClient} from '@supabase/supabase-js'
dotenv.config()
const {VITE_SUPABASE_URL,VITE_SUPABASE_ANON_KEY,DEEPSEEK_API_KEY,PORT=3000}=process.env
const app=express()
app.use(cors())
app.use(express.json())
const supabase=createClient(VITE_SUPABASE_URL,VITE_SUPABASE_ANON_KEY)
const scoreResponse=async(r,m)=>{
  const R=await fetch('https://api.deepseek.com/v1/chat/completions',{
    method:'POST',
    headers:{'Content-Type':'application/json','Authorization':`Bearer ${DEEPSEEK_API_KEY}`},
    body:JSON.stringify({
      model:"deepseek-chat",
      messages:[
        {role:"system",content:"The only valid answer is a score from 0 to 10 based on how accurate the response was based on the measurement of the given prompt"},
        {role:"user",content:`Response: "${r}"\nMeasurement: "${m}"`}
      ],
      temperature:0.3,
      max_tokens:50
    })
  })
  if(!R.ok)throw new Error(`Deepseek API error: ${R.statusText}`)
  const data=await R.json(),c=data.choices?.[0]?.message?.content
  if(!c)throw new Error('No response from Deepseek')
  return {score:parseInt(c.match(/\d+/)?.[0])||5}
}
app.post('/api/score',async(req,res)=>{
  try{
    const {responseText,questionId,userId}=req.body
    const {data:q,error:e}=await supabase.from('questions').select('measurement').eq('id',questionId).single()
    if(e)throw e
    const {score}=await scoreResponse(responseText,q.measurement)
    const {error:u}=await supabase.from('user_responses').update({score}).eq('user_id',userId).eq('question_id',questionId)
    if(u)throw u
    res.json({score})
  }catch(err){
    console.error('Error processing score request:',err)
    res.status(500).json({error:err.message})
  }
})
app.listen(PORT,()=>console.log(`Server running on port ${PORT}`))
