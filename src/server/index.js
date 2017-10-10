'use strict';
let CryptoJS = require('crypto-js');
let bodyParser = require('body-parser');
const express = require('express');
const url = 'mongodb://localhost:27017/epam';// already defined;
const app = express();
let mongodb = require('mongodb');
let MongoClient = mongodb.MongoClient;
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('dist'));
app.get('/heartbeat', (req, res) => {
  res.json({status: 'ok'});
});

/* eslint no-console: "off" */
app.listen(3000, () => {
  console.log('listening on port:3000');
});

app.post('/api/signup', function(req, res) {
  let sendContent = {
    'username': ' ',
    'email': '',
    'phone number': '',
    'full name': '',
    'password': '',
  };
  if (checkInfoValid(req, res, sendContent) === -1) {
    console.log('check failed');
    return;
  }
});

function checkInfoValid(req, res, sendContent) {
  return usernameCheck(req, res, sendContent);
}
function usernameCheck(req, res, sendContent) {
  if (req.body.username.replace(' ', '') === '') {
    let obj = {
      'error': 'the username is void',
    };
    res.status(400).send(obj);
    return -1;
  }
  // if (hasNumber(req.body.username)) {
  //   let obj = {
  //     'error': 'the username is invalid',
  //   };
  //   res.status(400).send(obj);
  //   return -1;
  // }
  MongoClient.connect(url, function(err, db) {
    if (err) {
      let obj = {
        'error': 'something went wrong',
      };
      res.status(500).send(obj);
      db.close();
      console.log('its conflict!');
      return -1;
    }
    db.collection('user').find({'username': req.body.username})
      .toArray(function(err, items) {
        if (items.length !== 0) {
          let obj = {
            'error': 'username conflicts!',
          };
          res.status(409).send(obj);
          db.close();
          return -1;
        }
        db.close();
        emailCheck(req, res, sendContent);
      });
  });
}
function emailCheck(req, res, sendContent) {
  if (req.body.email.replace(' ', '') === '') {
    let obj = {
      'error': 'the email is void',
    };
    res.status(400).send(obj);
    return -1;
  }
  if (!validateEmail(req.body.email)) {
    let obj = {
      'error': 'the email format is invalid',
    };
    res.status(400).send(obj);
    return -1;
  }
  MongoClient.connect(url, function(err, db) {
    if (err) {
      let obj = {
        'error': 'something went wrong',
      };
      res.status(500).send(obj);
      db.close();
      return -1;
    }
    db.collection('user').find({'email': req.body.email})
      .toArray(function(err, items) {
        if (items.length !== 0) {
          let obj = {
            'error': 'email conflicts!',
          };
          res.status(409).send(obj);
          db.close();
          return -1;
        }
        db.close();
        phonenumberCheck(req, res, sendContent);
      });
  });
}
function phonenumberCheck(req, res, sendContent) {
  if (req.body['phone number'] === '') {
    let obj = {
      'error': 'the phone number is void',
    };
    res.status(400).send(obj);
    return -1;
  }
  if (! /^\d+$/.test(req.body['phone number'])) {
    let obj = {
      'error': 'the phone number is invalid',
    };
    res.status(400).send(obj);
    return -1;
  }
  MongoClient.connect(url, function(err, db) {
    if (err) {
      let obj = {
        'error': 'something went wrong',
      };
      res.status(500).send(obj);
      db.close();
      return -1;
    }
    db.collection('user').find({'username': req.body.username})
      .toArray(function(err, items) {
        if (items.length !== 0) {
          let obj = {
            'error': 'phone number conflicts!',
          };
          res.status(409).send(obj);
          db.close();
          return -1;
        }
        db.close();
        fullnameCheck(req, res, sendContent);
      });
  });
}
function fullnameCheck(req, res, sendContent) {
  if (req.body['full name'].replace(' ', '') === '') {
    let obj = {
      'error': 'the full name is void',
    };
    res.status(400).send(obj);
    return -1;
  }
  if (hasNumber(req.body['full name'])) {
    let obj = {
      'error': 'the full name is invalid',
    };
    res.status(400).send(obj);
    return -1;
  }
  passwordCheck(req, res, sendContent);
}
function passwordCheck(req, res, sendContent) {
  if (req.body.password.length<=5) {
    let obj = {
      'error': 'the password is too short',
    };
    res.status(500).send(obj);
    return -1;
  }
  let encrypted = CryptoJS.AES.encrypt(req.body.password, 'Secret Passphrase');
  sendContent.username = req.body.username;
  sendContent.email = req.body.email;
  sendContent['phone number'] = req.body['phone number'];
  sendContent['full name'] = req.body['full name'];
  sendContent.password = encrypted.toString();
  MongoClient.connect(url, function(err, db) {
    if (err) {
      let obj = {
        'error': 'Something wrong!',
      };
      res.status(500).send(obj);
      db.close();
      return;
    }
    let objectId;
    db.collection('user').insert(sendContent, function() {
      objectId = sendContent._id;
    });
    res.set('location', '/api/signup'+objectId);
    res.status(201).send();
    console.log(sendContent);
    db.close();
  });
  // let encrypted = CryptoJS.AES.
  // encrypt(req.body.password, 'Secret Passphrase');
  // let decrypted = CryptoJS.AES.decrypt(encrypted, 'Secret Passphrase');
  // console.log(decrypted.toString(CryptoJS.enc.Utf8));
}

function validateEmail(email) {
  let re = /\S+@\S+\.\S+/;
  return re.test(email);
}

function hasNumber(myString) {
  return /\d/.test(myString);
}
