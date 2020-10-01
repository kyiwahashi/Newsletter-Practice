const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");
require('dotenv').config();

const app = express();

app.listen(process.env.PORT || 3000, function(){
  console.log("Server is running on port 3000");
});

// process.env.PORT is a dynamic port that Heorku will define at the go. The rest of it also lets it listen for 3000 locally

app.use(express.static("public"));

app.use(bodyParser.urlencoded({extended: true}));

app.get("/", function(req, res){
  res.sendFile(__dirname + "/signup.html");
});

app.post("/", function(req, res){
  const firstName = req.body.fName;
  const lastName = req.body.lName;
  const emailAddress = req.body.email;

  const data = {
    members: [
      {
        email_address: emailAddress,
        status: "subscribed",
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName,
        }
      }
    ]
  };

  // The parameters for const data come from the body parameters you can apply to MailChimp Lists.
  // You can find the available ones by checking the MailChimp List bookmark
  // Merge fields correspond to the ones you make active in your audience settings. Look at MailChimp Merge Fields bookmark


  const jsonData = JSON.stringify(data);

  // We need to transform data into a JSON string as that is what Mailchimp takes when receiving data



  const url = process.env.URL;

  // The const url is our API endpoint, where our data we gathered will be heading to be stored
  // The endpoint can be found in API conventions in Mailchimp.
  // The us2 in the beginning corresponds with the end of our APP ID
  // The key at the end is our list ID, which we got from going to Mailchimp.com and logging in, clicking audience from our account, and then manage audience, then settings. It is at the bottom

  const options = {
    method: "POST",
    auth: process.env.USER_PASS
  }

  // Now we need to send this data to MailChimp using https.request
  // Before however we must create an options const/javascript object, which will provide the method of post to transfer data, and authorization to authorize our use of the MailChimp API using the API key
  // Method lets us post to Mailchimp server, while auth allows us to authorize with username/password. The password is our API key.
  // Make sure the last digits correspond with the data center (server) we put in the beginning of our endpoint (us2)


  const request = https.request(url, options, function(response){
    if (response.statusCode === 200){
      res.sendFile(__dirname + "/success.html");
    } else {
      res.sendFile(__dirname + "/failure.html");
    }

    response.on("data", function(data){
      console.log(JSON.parse(data));
    })
  })

  // We can now send data. We must first set up an https.request to be able to send data to their Server
  // The url is our endpoint, options specify that we are posting data to their server and how we will authorize
  // The callback function explains when we receive a response (when we detect data sent back from mailchimp) to call another function to console.log Mailchimp's response. We use JSON.parse(data) to transform the hexidecimal data into a javascript object. It should show back the data we sent to it in response
  // The if/else statement is checking whether submission is successfully or not by looking back at the response's status statusCode
  // If 200(sucessful), takes user to success page. Otherwise, it takes them to the failure page
  // Failure page can occur also if the API key is wrong, or if the write method doesn't occur so if you want to test the failure page change the key or comment out the write method below



  app.post("/failure", function(req, res){
    res.redirect("/")
  });

  // app.post("/failure", function(req, res){
  //   res.sendFile(__dirname + "/signup.html");
  // });

  // I originally wrote the code above that's been commented out. It did work, but probably not the best solution
  // The redirect route is shorter and more efficient.

  request.write(jsonData);
  request.end();

  // Now that we have set up const request so we can now send data to Mailchimp Servers, we just use the write method and send the jsonData we set up beforehand with our user's data.
  // Then we end the request with request.end();

  console.log(firstName, lastName, emailAddress);

  // res.send("Thanks for posting");
})
