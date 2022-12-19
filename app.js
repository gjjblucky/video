const cors = require('cors')
const express = require('express')
const dotenv = require('dotenv')
const bodyParser = require('body-parser')
const mysql=require('mysql2/promise')
const multer = require('multer');
const path = require('path');
const config=require('./db.js')

// create the connection
const app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())
dotenv.config()
const router = express.Router()

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Escale@123',
    database: 'video'
  });

  // connection.connect(function(err) {
  //   if (err) throw err;
  //   console.log("Connected!");
  // });


  const videoStorage = multer.diskStorage({
    destination: 'videos', // Destination to store video 
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '_' + Date.now() 
         + path.extname(file.originalname))
    }
});

// const imageStorage = multer.diskStorage({
//   destination: 'images', // Destination to store image
//   filename: (req, file, cb) => {
//       cb(null, file.fieldname + '_' + Date.now() 
//        + path.extname(file.originalname))
//   }
// });

// const imageUpload = multer({
//   storage: imageStorage,
//   limits: {
//     fileSize: 1000000 // 1000000 Bytes = 1 MB
//   },
//   fileFilter(req, file, cb) {
//     if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) { 
//        // upload only png and jpg format
//        return cb(new Error('Please upload a Image'))
//      }
//    cb(undefined, true)
// }
// }) 

let fileFilter = async(file,type=[],res)=>{
  
  if(type.includes(file?.mimetype?.split("/")[1])){
    return true
  }
  else{
    return false
  }
}

const videoUpload = multer({
    storage: videoStorage,
    limits: {
    fileSize: 10000000 // 10000000 Bytes = 10 MB
    },
  //   fileFilter(req, file, cb) {
  //     // upload only mp4 and mkv format
  //   //   if (!file.originalname.match(/\.(mp4|MPEG-4|mkv)$/)) { 
  //      if(file.mimetype.split("/"))
      
  //     cb(undefined, true)
  //  }
})


app.get('/', (req, res) => { 
    res.send('Hello People'); 
});

// app.post('/image', imageUpload.single('image'), (req, res) => {
 
//   const image=req.file
//   res.send(image)
// }, (error, req, res, next) => {
//    res.status(400).send({ error: error.message })
//    console.log(error)
// })


// app.post('/Video', videoUpload.single('video'), (req, res) => {

//   const video=req.file
//     res.send(video)
//     // console.log(video.filename)

//  }, (error, req, res, next) => {
//      res.status(400).send({ error: error.message })
//      console.log(error)
//  })

app.post('/uploadVideo',videoUpload.fields(
  [{
    name:"video",
    maxCount:1
  },
  {
    name:"image",
    maxCount:1
  }
]
),   async(req, res) =>     {

  const connection = await mysql.createConnection(config)

  console.log(req.file,"kjsxgsh")
if(!req.files == 0){


const category=req.body.category
  const file= req.files

let videoFile = file?.video;


let imageFile= file?.image;

let result = await fileFilter(videoFile[0],["mp4","vga"]);


let result2 = await fileFilter(imageFile?.[0],["jpeg","png"]);

if(result == false && result2==false ){
  return res.json({
    success:false,
    message:"please uplaod mp4 or image"
  })
}



       await connection.execute( `INSERT INTO vid(video_url, video_type, avatar,category) VALUES (?,?,?,?)`,[
            (videoFile?.[0].filename || null),
            (videoFile?.[0].mimetype || null),
            (imageFile?.[0].filename || null),
            (category || null)
          ]);



          res.json({message:"success", status:'uploaded'});
        }else{
          return res.send({
            message:"please upload video and image"
          })
        }
        
  });


  app.get('/getlist', async (req,res) => {
    const connection = await mysql.createConnection(config)

 const  result =await connection.execute('SELECT * FROM vid')

console.log(result[0])


    if(result !== 0){
      res.json({message:"success", data:result[0]})
    }else{
      res.json({message:false})
    }
  })
// const smtpRoutes = require('./router/smtp')


// app.use('/logdata', smtpRoutes)


app.listen(3000, () => {
  console.log('server running on 3000 port')
})
