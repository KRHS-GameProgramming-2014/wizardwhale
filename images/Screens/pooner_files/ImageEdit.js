Thingiverse.ImageEdit = function(opts) {
  if (!opts || typeof opts !== 'object') {
    opts = {};
  }
  
  this.settings = $.extend(true, {}, this.defaultSettings, opts);
  
  this.init();
  
  return this;
};

Thingiverse.ImageEdit.prototype.defaultSettings = {
  // Container where the image and upload trigger lives
  $container: $('.img-wrapper'),
  // Trigger to show inline upload options
  // If not set, defaults to element inside $container with class edit-photo
  $editTrigger: null,
  // Container that holds the iframe upload
  // If not set, defaults to the container next to $container with the class inline-upload
  $uploadContainer: null,
  // The iframe, if not set, it will be set to the iframe inside of $uploadContainer
  $iframe: null,
  // Params to create new FormFileBttn Object
  formFileBttn: {
    external: '#upload-container',
    target: '#file',
    type: 'div',
    style: 'inline-btn',
    html: '<span id="upload_msg">Upload Your Own</span>'
  },
  // Optional additional method to call when upload is complete
  complete: null
};

Thingiverse.ImageEdit.prototype.init = function() {
  var self = this;
  
  // Set default $uploadContainer
  if (self.settings.$uploadContainer === null) {
    self.settings.$uploadContainer = self.settings.$container.next('.inline-upload');
  }
  
  // Set default $iframe
  if (self.settings.$iframe === null) {
    self.settings.$iframe = self.settings.$uploadContainer.find('iframe');
  }
  
  // Set default $editTrigger
  if (self.settings.$editTrigger === null) {
    self.settings.$editTrigger = self.settings.$container.find('.edit-photo');
  }
  
  // Bind events
  self.settings.$editTrigger.on('click', function(e) {
      e.preventDefault();
      self.toggleUploadContainers();
  });
    
  $(document).on('imageUploaded', function(e, data) {
    self.imageUploaded(e, data);
  });
};

Thingiverse.ImageEdit.prototype.toggleUploadContainers = function() {
  var self = this;
  
  self.settings.$uploadContainer.toggleClass('active');
  self.settings.$container.toggleClass('active');
};

Thingiverse.ImageEdit.prototype.hideUploadContainers = function() {
  var self = this;
    
  self.settings.$container.removeClass('active');
  self.settings.$uploadContainer.removeClass('active');
};

Thingiverse.ImageEdit.prototype.imageUploaded = function(e, data) {
  var self = this;
  
  if (self.settings.$iframe) {
    // Make sure this is what we are listening for
    if (self.settings.$iframe.attr('id') === data.iframe_id) {
      self.hideUploadContainers();
    }
  }
  
  if (typeof self.settings.complete === 'function') {
    self.settings.complete();
  }  
};