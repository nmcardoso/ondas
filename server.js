const express = require('express')
const ytdl = require('ytdl-core')
const ffmpeg = require('fluent-ffmpeg')
const app = express()

app.use('/static', express.static(__dirname + '/public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html')
})

app.get('/search', async (req, res) => {
  const url = `https://www.googleapis.com/youtube/v3/search?type=video&part=snippet&q=${req.query.q}&maxResults=30&key=${process.env.YT_API_KEY}`
  const r = await fetch(url, {
    headers: {
      'Accept': 'application/json'
    }
  })
  const obj = await r.json()
  res.send(obj)
  console.log(obj)
})

app.get('/details/:id', async (req, res) => {
  const url = `https://www.googleapis.com/youtube/v3/videos?id=${req.params.id}&part=contentDetails&key=${process.env.YT_API_KEY}`
  const r = await fetch(url, {
    headers: {
      'Accept': 'application/json'
    }
  })
  const obj = await r.json()
  const re = /^PT(\d+)M(\d+)S$/
  const duration = obj.items[0].contentDetails.duration
  const m = duration.match(re)
  const seconds = parseInt(m[1]) * 60 + parseInt(m[2])
  res.json(seconds)
  console.log(obj)
})

app.get('/autocomplete', async (req, res) => {
  const url = `http://suggestqueries.google.com/complete/search?ds=yt&client=firefox&hl=en-BR&q=${req.query.q}`
  const r = await fetch(url, {
    headers: {
      'Accept': 'application/json'
    }
  })
  const arr = await r.arrayBuffer()
  const encoded = iconv.decode(Buffer.from(arr), 'iso-8859-1')
  res.header("Content-Type", "application/json; charset=utf-8");
  res.send(encoded)
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
