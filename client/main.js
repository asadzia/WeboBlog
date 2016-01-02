// Set the Routing

Router.configure({
  layoutTemplate: 'ApplicationLayout'
});

Router.route('/', function () {
  this.render('welcomePage', {
    to:"main"
  });
});

Router.route('/websites', function () {
  this.render('NavigationBar', {
    to:"navbar"
  });
  this.render('website_content', {
    to:"main"
  });
});

Router.route('/website/:_id', function () {
  this.render('NavigationBar', {
    to:"navbar"
  });
  this.render('website_item_two', {
    to:"main", 
    data:function(){
      return Websites.findOne({_id:this.params._id});
    }
  });
   this.render('myComments', {
    to:"comments"
  });
});

// the configuration for the comments section

Comments.ui.config({
    limit: 20, // default 10
    loadMoreCount: 20, // default 20
    template: 'bootstrap', // default 'semantic-ui'
    defaultAvatar: 'my/defaultavatarimage.png' // default 'http://s3.amazonaws.com/37assets/svn/765-default-avatar.png'
});

Comments.changeSchema(function (currentSchema) {
  currentSchema.image = { type: Object, optional: true };
});	
	// Accounts configuration to add USERNAME option

	Accounts.ui.config({
	passwordSignupFields: "USERNAME_AND_EMAIL"
	});

// jquery code to help pop up more websites when scrolling down the page

Session.set("websiteLimit", 8);
lastScrollTop = 0; 
$(window).scroll(function(event){
// test if we are near the bottom of the window
if($(window).scrollTop() + $(window).height() > $(document).height() - 100) {
  // where are we in the page? 
  var scrollTop = $(this).scrollTop();
  // test if we are going down
  if (scrollTop > lastScrollTop){
    // yes we are heading down...
   Session.set("websiteLimit", Session.get("websiteLimit") + 2);
  }

  lastScrollTop = scrollTop;
}
    
})

/////
// template helpers 
/////

// helper function that returns all available websites
Template.website_list.helpers({
	websites:function(){
		return Websites.find({}, {sort:{score_up:-1}, limit:Session.get("websiteLimit")});
	}
});

	Template.website_item.helpers({
		getUser:function(user_id)
		{
		  var user = Meteor.users.findOne({_id:user_id});
		  if (user)
		  {
		    return user.username;
		  }
		  else
		  {
		    return "Anonymous";
		  }
		}
	});

	Template.website_item_two.helpers({
		getUser:function(user_id)
		{
		  var user = Meteor.users.findOne({_id:user_id});
		  if (user)
		  {
		    return user.username;
		  }
		  else
		  {
		    return "Anonymous";
		  }
		}
	});



	/////
	// template events 
	/////

	Template.website_item.events({
		"click .js-upvote":function(event){
			 
			// example of how you can access the id for the website in the database
			// (this is the data context for the template)
			var website_id = this._id;
			console.log("Up voting website with id "+website_id);

			// increment by one by using the command $inc
			if (!Meteor.user()){
				throw new Meteor.Error(401, "You need to login to upvote");
			}
			else if (!website_id)
			{
				throw new Meteor.Error(422, 'Post not found');
			}

			else if (_.include(this.upvoters, website_id)){
    			  throw new Meteor.Error(422, 'Already upvoted this post');
    		}
    		else { 
				Websites.update({_id:website_id}, 
            				    {$inc: {score_up:1}, $addToSet: {upvoters: website_id}});
			}

			return false;// prevent the button from reloading the page
		}, 
		"click .js-downvote":function(event){
			
			// example of how you can access the id for the website in the database
			// (this is the data context for the template)
			var website_id = this._id;
			console.log("Down voting website with id "+website_id);

			if (!Meteor.user()){
				throw new Meteor.Error(401, "You need to login to DownVote");
			}
			else if (!website_id)
			{
				throw new Meteor.Error(422, 'Post not found');
			}

			else if (_.include(this.downvoters, website_id)){
    			  throw new Meteor.Error(422, 'Already DownVoted this post');
    		}
    		else {
				Websites.update({_id:website_id}, 
                				{$inc: {score_down:1}, $addToSet: {downvoters: website_id}});
			}

			return false;// prevent the button from reloading the page
		}
	});

	Template.website_item_two.events({
		"click .js-upvote":function(event){
			 
			// example of how you can access the id for the website in the database
			// (this is the data context for the template)
			var website_id = this._id;
			console.log("Up voting website with id "+website_id);

			if (!Meteor.user()){
				throw new Meteor.Error(401, "You need to login to upvote");
			}
			else if (!website_id)
			{
				throw new Meteor.Error(422, 'Post not found');
			}

			else if (_.include(this.upvoters, website_id)){
    			  throw new Meteor.Error(422, 'Already upvoted this post');
    		}
    		else { 
				Websites.update({_id:website_id}, 
            				    {$inc: {score_up:1}, $addToSet: {upvoters: website_id}});
			}

			return false;// prevent the button from reloading the page
		}, 
		"click .js-downvote":function(event){
			
			// example of how you can access the id for the website in the database
			// (this is the data context for the template)
			var website_id = this._id;
			console.log("Down voting website with id "+website_id);

			if (!Meteor.user()){
				throw new Meteor.Error(401, "You need to login to DownVote");
			}
			else if (!website_id)
			{
				throw new Meteor.Error(422, 'Post not found');
			}

			else if (_.include(this.downvoters, website_id)){
    			  throw new Meteor.Error(422, 'Already DownVoted this post');
    		}
    		else {
				Websites.update({_id:website_id}, 
                				{$inc: {score_down:1}, $addToSet: {downvoters: website_id}});
			}

			return false;// prevent the button from reloading the page
		}
	});

	Template.website_form.events({
		"click .js-toggle-website-form":function(event){
			$("#website_form").toggle("slow");
		}, 
		"submit .js-save-website-form":function(event){
			var url, title, description, score_up, score_down;
			
			// get the content from the modal form fields.
			url = event.target.url.value;
			title = event.target.title.value;
			description = event.target.description.value;

			// initilize the scores of the upvote and downvote buttons here
			score_up = 0;
			score_down = 0;
			
			// save the content from the modal form
			if (Meteor.user())
			{
				console.log("URL: " + url + " Title: " + title + " Description:" + description);
				Websites.insert({
					url:url,
					title:title,
					description: description,
					createdOn:new Date(),
					createdBy:Meteor.user()._id,
					score_up:score_up,
					score_down:score_down,
					upvoters: [],
           			downvoters: []
				});
			}
			$("#website_form").modal("hide");

			// stop the form submit from reloading the page
			return false;
		}
	});