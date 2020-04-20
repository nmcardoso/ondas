const express = require('express')
const ytdl = require('ytdl-core')
const ffmpeg = require('fluent-ffmpeg')
const app = express()

app.use('/static', express.static(__dirname + '/public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html')
})

app.get('/download/:id', (req, res) => {
  const url = `https://youtube.com/watch?v=${req.params.id}`
  const stream = ytdl(url)
  const proc = new ffmpeg({ source: stream })
  proc.setFfmpegPath('ffmpeg')
  proc.withAudioBitrate(128)
  proc.toFormat('mp3')
  res.writeHead(200, {
    'Content-Type': 'audio/mp3',
    'Content-Disposition': 'attachment'
  })
  proc.on('error', (err, stdout, stderr) => {
    console.log(`Error: ${err.message}`)
  })
  proc.on('end', (stdout, stderr) => {
    console.log('Transcoding succeeded!')
  })
  proc.pipe(res, { end: true })
})

app.listen(process.env.PORT || 3000, () => {
  console.log(`App runing at port ${process.env.PORT || 3000}`)
})
