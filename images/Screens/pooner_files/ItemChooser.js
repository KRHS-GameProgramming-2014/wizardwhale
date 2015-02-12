Thingiverse.ItemChooser = function(opts) {
  if (!opts || typeof opts !== 'object') {
    opts = {};
  }
  
  this.settings = $.extend(true, {}, this.defaultSettings, opts);
  
  this.init();
  
  return this;
};

Thingiverse.ItemChooser.prototype.defaultSettings = {
  $itemChooser        : $('#item_chooser'), // The modal
  $chooserNav         : $('#item_chooser .modal-nav'), // The nav inisde the modal for selecting type of item
  $itemsContent       : $('#item_chooser .modal_selector_content'), // Where the items will be loaded
  $closeChooser       : $('#item_chooser span.close'), // Close modal
  $chooserParent      : $('.choose_item'), // Parent div of showChooserSelector so we can efficiently delegate events
  showChooserSelector : '.select_item', // Show modal,
  chooseItemSelector  : '.template-micro', // jQuery selector for choosing an item
  base_url            : null, // The endpoint to load items from
  source_data         : {}, // Any data neeeded to load items
  onChoose            : null, // Function in success callback of choice
  $searchForm         : $('.modal_selector form')
};

Thingiverse.ItemChooser.prototype.init = function() {
  var self = this;
  
  // The modal needs to be outside the containing divs to work
  self.settings.$itemChooser.detach().appendTo('body');
  
  self.settings.$chooserParent.on('click', self.settings.showChooserSelector, function(e) {
    e.preventDefault();
    
    // Might want to know what triggered this
    self.trigger = $(this);
    self.showItemChooser();
  });
  
  self.settings.$chooserNav.find('a').on('click', function(event) {
    event.preventDefault();
    
    var $this = $(this);
    if($this.hasClass('active')) {
      return false;
    }
    
    self.settings.$chooserNav.find('.active').removeClass('active');
    $this.addClass('active');
    
    self.populateItems();
  });
  
  self.settings.$closeChooser.on('click', function(){
    self.hideItemChooser();
  });
  
  self.settings.$itemsContent.on('click', self.settings.chooseItemSelector, function(event) {
    self.chooseItem($(this));
  });
  
  // Bind search form
  self.settings.$searchForm.on('submit', function(e) {
    e.preventDefault();
    
    var $this = $(this);
    var $icon = $this.find('.search-icon');
    var value = $this.find('input[name="q"]').val();
    var data = self.serializeForm($this);
    
    self.populateItems(data);
    
    if (value) {
        $icon.addClass('active');
    } else {
        $icon.removeClass('active');
    }
  });
  
  self.settings.$searchForm.find('.search-icon').on('click', function() {
      var $this = $(this);
      var $form = $this.closest('form');
      var $input = $form.find('input[name="q"]');
      
      if ($input.val()) {
          if ($this.hasClass('active')) {
              $input.val('');
          }
      }
      
      $form.trigger('submit');
  });
};

Thingiverse.ItemChooser.prototype.showItemChooser = function() {
  var self = this;
  
  self.settings.$itemChooser.modal('show');
  $('body', 'html').css({
    'height': '100%',
    'overflow': 'hidden'
  });
  self.populateItems();
};

Thingiverse.ItemChooser.prototype.hideItemChooser = function() {
  var self = this;
  
  $('body', 'html').css({
    'height': 'auto',
    'overflow': 'auto'
  });
  self.settings.$itemChooser.modal('hide');
};

Thingiverse.ItemChooser.prototype.chooseItem = function($element) {
  var self = this;
  
  var type = $element.data('type');
  var id = $element.data('id');
  
  var template = (type === 'Thing' || type === 'Make') ? 'draw_thing' : 'draw_collection';
  var requestData = $.extend(true, self.settings.source_data, {'type': type, 'model_id': id});
  
  $.get(
    self.settings.base_url, requestData, function(response) {
      if (response) {
        if (typeof self.settings.onChoose === 'function') {
          self.settings.onChoose(self.trigger, requestData, response);
        }
      }
    },
    'html'
  );
  
  self.hideItemChooser();
};

Thingiverse.ItemChooser.prototype.populateItems = function(data) {
  var self = this;
  var $selectedNav = self.settings.$chooserNav.find('.active');
  var type = $selectedNav.data('type');
  var slug = $selectedNav.attr('href').split('#')[1];
  data = data ? data : {};
  
  self.settings.$itemsContent.find('.active').removeClass('active');
  self.settings.$itemsContent.addClass('loading');
  
  var $loadContainer = self.settings.$itemsContent.find('.item_chooser_'+type);
  var $resultsContainer;
  var requestData = $.extend(true, self.settings.source_data, data);
  var url = self.settings.base_url + slug;
  
  // If this has data being passed, don't trust that it's been loaded
  if (!$.isEmptyObject(data)) {
    $loadContainer.removeClass('loaded').addClass('loading');
  }
  
  if(!$loadContainer.hasClass('loaded')) {
    $loadContainer.html('').append('<div class="results"></div>');
    $resultsContainer = $loadContainer.find('.results');
    $resultsContainer.load(url, requestData, function() {
        self.settings.$itemsContent.removeClass('loading');
        $loadContainer.addClass('loaded active');
    });
  }
  else {
    self.settings.$itemsContent.removeClass('loading');
    $loadContainer.addClass('active');
  }
  
  self.scroller = new Thingiverse.Scroller(
    {
      container: $resultsContainer,
      source: url,
      source_data: self.settings.source_data,
      scrollContainer: $('.modal_selector_content')
    }
  );
  
};

Thingiverse.ItemChooser.prototype.serializeForm = function($form) {
  var o = {};
  var a = $form.serializeArray();
  
  $.each(a, function() {
      if (o[this.name] !== undefined) {
          if (!o[this.name].push) {
              o[this.name] = [o[this.name]];
          }
          o[this.name].push(this.value || '');
      } else {
          o[this.name] = this.value || '';
      }
  });
  
  return o;
};
