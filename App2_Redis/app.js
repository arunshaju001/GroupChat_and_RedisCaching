import express from 'express';
import redis from 'redis'
const axios = require('axios');
const app = express();
const port = 3000;

//Connecting redis
const client = redis.createClient({
    host: '127.0.0.1',
    port: 6379
})


app.get('/search', (req, res) => {
    const country = (req.query.country);
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=parse&format=json&section=0&page=${country}`;
  
    return client.get(`wikipedia:${country}`, (err, result) => {
      if (result) {
        const resultJSON = JSON.parse(result);
        return res.status(200).json(resultJSON);
      } else {
        return axios.get(searchUrl)
          .then(response => {
            const responseJSON = response.data;
            client.set(`wikipedia:${country}`, JSON.stringify({ source: 'Redis Cache', ...responseJSON, }));
            return res.status(200).json({ source: 'Wikipedia API', ...responseJSON, });
          })
          .catch(err => {
            return res.json(err);
          });
      }
    });
  });

app.get('/',(req,res) => {
    res.redirect('/search?country=india')
})

app.listen(port,() => {
    console.log('app is running on port : '+ port)
})