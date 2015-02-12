
// class Thingiverse.Event
// handles feed events
Thingiverse.Event = function(json){
  for ( var attribute in json )
  {
    if ( json.hasOwnProperty(attribute) )
      this[attribute] = json[attribute];
  }
  this.constructMessage();
  if ( this.message )
  {
    var shortMessage = this.message.substring(0, 50);
    if ( this.message.length>50 )
      shortMessage += "...";
    this.element = Thingiverse.Event.template({
      target_url: this.target.url,
      target_thumb: this.target.thumb,
      target_type: this.target.type.toLowerCase(),
      message: shortMessage
    });
  }
}

// helper function to set this.message
Thingiverse.Event.prototype.constructMessage = function()
{
  // lookup table of human-format
  // removing entries from this table ignores those messages
  // could also be
  // view: 'viewed',
  // unlike: 'unliked',
  // unfollow: 'unfollowed',
  var action_lookup = {
    download: 'downloaded',
    comment: 'commented on',
    publish: 'published',
    make: 'made a copy of',
    like: 'liked',
    derive: 'made a thing based on',
    collect: 'collected',
    follow: 'started following',
    update: 'made an update to',
    feature: 'featured',
    authorize: 'started using',
    unauthorize: 'stopped using'
  }
  // if we didn't get enough stuff, bail
  if ( !this.user || !this.target || !this.user.name || !action_lookup[this.event_type] || !this.target.name )
    return undefined;
  var tokens = new Array();
  if ( this.event_type=='feature' )
    tokens.push('Thingiverse');
  else
    tokens.push(this.user.name);
  tokens.push(action_lookup[this.event_type]);
  tokens.push(this.target.name)
  this.message = tokens.join(' ');
  return this.message;
}

// static variable for underscore templating
Thingiverse.Event.template = _.template($('#event_template').html());

