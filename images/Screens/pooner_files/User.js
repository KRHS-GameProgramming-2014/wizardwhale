
/**
 * class User
 * will eventually handle all things related to a thingiverse user
**/
Thingiverse.User = function(json){
  // for those of you wondering why I'm not using Object.create... IE
  for ( var attribute in json )
  {
    if ( json.hasOwnProperty(attribute) )
      this[attribute] = json[attribute];
  }
  this.last_active = new Date(this.last_active);
}

/**
 * function template_mini
 * underscore templating
 * @access public static
**/
Thingiverse.User.template_mini = _.template($('#usermini_template').html());

/**
 * function getElementMini
 * @return the mini template view for this user
**/
Thingiverse.User.prototype.getElementMini = function()
{
  if ( typeof(this.element_mini)=='undefined' || !this.element_mini )
    this.element_mini = Thingiverse.User.template_mini(this);
  return this.element_mini;
}

