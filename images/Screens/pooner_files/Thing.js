
// class Thingiverse.Thing
Thingiverse.Thing = function() {
};

// thing action: handle liking things
Thingiverse.Thing.like_action_callback = function(e) {
  e.preventDefault();
  var $this = $(this),
  $thing = $this.closest('div.thing-interaction-parent');

	if ($thing.data('makeId')) {
		var id = $thing.data('makeId'),
			thingType = 'makes';
	} else if ($thing.data('collectionId')) {
		var id = $thing.data('collectionId'),
			thingType = 'thingcollection';
	} else {
		var id = $thing.data('thingId'),
			thingType = 'things';
	}

  $this.addClass('waiting');

	$.when(update_like(id, thingType))
	.done(function(data) {
    update_thing_like($this);
	})
	.fail(function(data) {
	})
	.always(function(data) {
    $this.removeClass('waiting');
	});

  return false;
}

// thing action: handle watching things
Thingiverse.Thing.watch_action_callback = function(e) {
  e.preventDefault();
  var $this = $(this),
      thingId = $this.closest('div.thing-interaction-parent').data('thingId');

  $this.addClass('waiting');

	$.when(update_follow({
	  'action': 'toggle',
	  'target_id': thingId,
	}))
	.done(function(data) {
    update_thing_follow($this);
	})
	.fail(function(data) {
	})
	.always(function(data) {
    $this.removeClass('waiting');
	});

  return false;
}

// thing action: callback for clicks on the collect thing action
Thingiverse.Thing.collect_action_callback = function(e) {
  e.preventDefault();
	var $parent = $(this).closest('.thing-interaction-parent'),
		  $form = $parent.find('form.collect-form');

  	//Update the collection form if there are new options
  	if(collectionOpts) {
  	  var $select = $form.find('select');
  	  $select.html(collectionOpts);
  	  $select.val($select.find('option').eq(-2).val());

  	  $form.find('div.new-collection-name').removeClass('active');
  	}

	$form.toggleClass('active');

  return false;
}

// thing action: cancel collect
Thingiverse.Thing.collect_cancel_callback = function() {
	var $form = $(this).closest('form.collect-form');

	$form.removeClass('active');
	return false;
}

// thing action: collect a thing
Thingiverse.Thing.collect_form_submit = function() {
  var self = this;
	$.when(submit_collection_form(this))
	.done(function(data) {
    // there is a '.thing-interact' either as a sibling or parent,
    // find it and update the collection state
    $(self).prev('.thing-interact').children('.thing-collect').addClass('active');
    $(self).parent('.thing-interact').children('.thing-collect').addClass('active');

    if(typeof(mw)!='undefined' && mw.appAttributeExists('refreshLibraryTab')) {
      // if we've got a makerware object refresh the library
      mwThingiverse.refreshLibraryTab();
      
      //And if we have a view in library button, show it
      if($('.view-in-library').length) {
        $('.view-in-library').addClass('is_collected');
      }
    }
  })
	.fail(function(data) {
	});

	return false;
}

// thing action collect form: change selected collection
Thingiverse.Thing.collect_form_selection_changed = function() {
  var $this = $(this),
      $newCollectionWrapper = $this.parent().find('div.new-collection-name');


  if($this.val() === '-1') {
    $newCollectionWrapper.addClass('active');
  }
  else {
    $newCollectionWrapper.removeClass('active');
  }
}


//For any Thing boxes
$document.on(clickEventType, 'span.thing-like:not(.disabled, .waiting)', Thingiverse.Thing.like_action_callback)
.on(clickEventType, 'span.thing-watch:not(.disabled, .waiting)', Thingiverse.Thing.watch_action_callback)
.on(clickEventType, 'span.thing-collect:not(.disabled)', Thingiverse.Thing.collect_action_callback)
.on(clickEventType, 'button.collection-cancel', Thingiverse.Thing.collect_cancel_callback)
.on('submit', 'form.collect-form', Thingiverse.Thing.collect_form_submit)
.on('change', 'form.collect-form select', Thingiverse.Thing.collect_form_selection_changed)
.on(clickEventType, '.thing-about', function (e) {
	// When clicking on the thing-about overlay, redirect to the thing if not on a link
	if (e.target.tagName.toLowerCase() != 'a') {
		var $thing = $(this).siblings('a.thing-img-wrapper');

		if ($thing.length != 0) {
			document.location = $thing.attr('href');
			e.preventDefault();
			return false;
		}
	}
})
;

