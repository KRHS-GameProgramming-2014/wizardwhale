// This is basically meant to be used in conjunction with ItemChooser.js but it doesn't have to be
// Manages adding and removing items
Thingiverse.ItemRanker = function(opts) {
  if (!opts || typeof opts !== 'object') {
    opts = {};
  }
  
  this.settings = $.extend(true, {}, this.defaultSettings, opts);
  
  this.init();
  
  return this;
};

Thingiverse.ItemRanker.prototype.defaultSettings = {
  $rankingsContainer  : $('.items_rank'), // The container that holds the interaction DOM elements
  itemSelector        : '.thing',
  $addItemTemplate    : $('.select_item:last'), // Used for display when an item is removed from a block
  removeItemSelector  : '.thing .remove-btn'
  
};

Thingiverse.ItemRanker.prototype.itemsAdded = {}; // This is keyed by rank

Thingiverse.ItemRanker.prototype.itemsRemoved = [];

Thingiverse.ItemRanker.prototype.init = function() {
  var self = this;
  
  // Need to attach to the container since these are dynamically added and removed
  self.settings.$rankingsContainer.on('click', self.settings.removeItemSelector, function() {
      self.removeItem($(this).closest(self.settings.itemSelector));
  });
};

Thingiverse.ItemRanker.prototype.addItem = function($trigger, data) {
  var self = this;
  var rank = $trigger.index() + 1;
  var type = data.type;
  var item_id = data.model_id;
  
  // Check if this has already been added
  var $existingSpot = self.settings.$rankingsContainer.find('.thing[data-type="'+type+'"][data-id="'+item_id+'"]');
  if ($existingSpot.length) {
    self.removeItem($existingSpot);
  }
  
  $.when(Thingiverse.loadThing({id: item_id, theme: 'chooser'}))
  .done(function(thingHtml) {
      $trigger.replaceWith(thingHtml);
  })
  .fail(function(response) {
     alert('There was a problem with your request');
  });
  
  self.itemsAdded[rank] = {'type': type, 'id': item_id, 'rank': rank};
};

Thingiverse.ItemRanker.prototype.removeItem = function($element) {
  var self = this;
  var type = $element.data('type');
  var item_id = $element.data('id');
  var rank = $element.index() + 1;
  
  $element.replaceWith(self.settings.$addItemTemplate.clone());
  self.itemsRemoved.push({'type': type, 'id': item_id, 'rank': 0});
  
  // In case it happens to be in the itemsAdded, remove it
  delete self.itemsAdded[rank];
};

// If using the rankings with a form, use this method to create and attach
// input elements that will be submitted
Thingiverse.ItemRanker.prototype.createInputs = function($form) {
  var self = this;
  var removed_length = self.itemsRemoved.length;
  var item;
  
  // The array index is by ranking which does not include 0
  for (var rank in self.itemsAdded) {
      item = self.itemsAdded[rank];
      $form.append($('<input type="hidden" name="featured[add]['+ item.type +']['+ item.id +']" value="'+ item.rank +'">'));
  }
  
  for (var ri = 0; ri < removed_length; ri++) {
      item = self.itemsRemoved[ri];
      if (item) {
        $form.append($('<input type="hidden" name="featured[remove]['+ item.type +']['+ item.id +']" value="0">'));
      }
  }
};
