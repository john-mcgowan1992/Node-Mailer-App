var fs = require('fs');
var ejs = require('ejs');
var tumblr = require('tumblr.js');
var mandrill = require('mandrill-api/mandrill');

//store API keys and split them into array
var apiKeys = fs.readFileSync('apiKeys.csv', 'utf8');

var splitApi = apiKeys.split('\n');

var mandrill_client = new mandrill.Mandrill(splitApi[4]);

//establish access to tumblr profile 
var client = tumblr.createClient({
  consumer_key: splitApi[0],
  consumer_secret: splitApi[1],
  token: splitApi[2],
  token_secret: splitApi[3] 
});

//mandrill api
var mandrill_client = new mandrill.Mandrill(splitApi[4]);

//load files 
var csvFile = fs.readFileSync("friend_list.csv","utf8");
var emailTemplate = fs.readFileSync('email_template.html', 'utf8');
var ejsTemplate = fs.readFileSync('email_template.ejs', 'utf8');

//store API keys and split them into array
var apiKeys = fs.readFileSync('apiKeys.csv', 'utf8');

var splitApi = apiKeys.split('\n');



//parse contact CSV file into an Array of contact Objects
function csvParse (csvInput) {
		var objArr = [];
	//split string by line
		var breakDown = csvFile.split('\n');
	//isolate property names
		var keyVals = breakDown[0].split(',');
	//split each line of data by commas, loop through and assign data to property names in new Obj
		for (var i = 1; i < breakDown.length; i++) {
				var newObj = {};
				var propVals = breakDown[i].split(",");
				for (var v = 0; v < keyVals.length; v++) {
					newObj[keyVals[v]] = propVals[v];
				}
			objArr.push(newObj);
		}
		return objArr;
}

var friends = csvParse(csvFile);

//customize email templates
/*
function customTemp (contacts) {
	contacts.forEach(function(friend){
		//copy template and create custom values
		var newEmailTemp = emailTemplate;
		var firstName = friend['firstName'];
		var numMonthsSinceContact = friend['numMonthsSinceContact'];
		//replace placeholders with custom values using regExp
		newEmailTemp = newEmailTemp.replace(/FIRST_NAME/gi, firstName);
		newEmailTemp = newEmailTemp.replace(/NUM_MONTHS_SINCE_CONTACT/gi, numMonthsSinceContact);

		//print template
		console.log(newEmailTemp);
	})
} */

//customize templates using EJS
function customEjsTemp (contacts) {
	contacts.forEach(function(person){
		var tempTry = ejsTemplate;
		person.latestPosts = latestPosts;
		var newEjsTemplate = ejs.render(tempTry, person);
		console.log(newEjsTemplate);
	})
}


//create latest posts 
var latestPosts = [];


//send emails with customized messages
	//add latest emails by recency
var sendCustomEmails = client.posts('john-mcgowan.tumblr.com', function(err, blog){
	var recency = 604800;
	//populatre latestPosts Array
  		for (var i = 0; i < blog.posts.length; i++) {
  			if (Date.now()/1000 - blog.posts[i].timestamp < recency) {
  				latestPosts.push(blog.posts[i]);
  			}
  		}
  	//loop through Contact list and send emails accordingly 
  		for (var m = 0; m < friends.length; m++){
	  		var tempTry = ejsTemplate;
			friends[m].latestPosts = latestPosts;
			var newEjsTemplate = ejs.render(tempTry, friends[m]);
			sendEmail(friends[m].firstName, friends[m].emailAddress, 'John McGowan', 'mcgowanj92@gmail.com', 'Tubmlr Posts', newEjsTemplate);
  		}
})

//send mail function
 function sendEmail(to_name, to_email, from_name, from_email, subject, message_html){
    var message = {
        "html": message_html,
        "subject": subject,
        "from_email": from_email,
        "from_name": from_name,
        "to": [{
                "email": to_email,
                "name": to_name
            }],
        "important": false,
        "track_opens": true,    
        "auto_html": false,
        "preserve_recipients": true,
        "merge": false,
        "tags": [
            "Fullstack_Tumblrmailer_Workshop"
        ]    
    };
    var async = false;
    var ip_pool = "Main Pool";
    mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool}, function(result) {
        // console.log(message);
        // console.log(result);   
    }, function(e) {
        // Mandrill returns the error as an object with name and message keys
        console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
        // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
    });
 }

