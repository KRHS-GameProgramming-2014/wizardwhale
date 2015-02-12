Thingiverse.Comment = function() {
};

Thingiverse.Comment.delete = function(comment_id, event) {
  event.preventDefault();

  if (confirm('Are you sure you want to delete this comment?')) {
    $.ajax({
      type: "POST",
      url: '/ajax/comments/delete',
      data: {comment_id: comment_id},
      success: function() {
				$('#comment-' + comment_id).show();
				$('#comment-form-edit').remove();
        $('#comment-' + comment_id).html('<div class="comment-deleted">Comment has been deleted</div>');
      },
      error: function() {
        console.log('error!');
      }
    });
  }
}

Thingiverse.Comment.create = function(form, event) {
  event.preventDefault();
  
  $.ajax({
    type: "POST",
    url: '/ajax/comments/create',
    data: $(form).serializeObject(),
    success: function(partial) {
      $('#comments').prepend(partial);
      form.reset();
    },
    error: function(error) {
      console.log(error);
      alert('Error: ' + error.responseText);
    }
  });
}

Thingiverse.Comment.reply = function(form, event) {
  event.preventDefault();
  form_data = $(form).serializeObject();
  
  $.ajax({
    type: "POST",
    url: '/ajax/comments/create',
    data: form_data,
    success: function(partial) {
      $('#comment-'+form_data.parent_id+'-children').prepend(partial);
      $('#comment-form-reply').remove();
    },
    error: function(error) {
      console.log(error);
      alert('Error: ' + error.responseText);
    }
  });
}

Thingiverse.Comment.edit = function(form, event) {
  event.preventDefault();
  form_data = $(form).serializeObject();
  
  $.ajax({
    type: "POST",
    url: '/ajax/comments/edit',
    data: form_data,
    success: function(comment_text) {
      $('#comment-form-edit').remove();
      $('#comment-' + form_data.comment_id).replaceWith(comment_text);
      $('#comment-' + form_data.comment_id).show();
    },
    error: function(error) {
      console.log(error);
      alert('Error: ' + error.responseText);
    }
  });
}

Thingiverse.Comment.edit_form = function(comment_id, event) {
  event.preventDefault();
  
  // remove any existing edit forms, prevents multiple forms if you click reply several times
  $('#comment-form-edit').remove();
  
  $.ajax({
    type: "GET",
    url: '/ajax/comments/_form',
    data: {
      form_type: 'edit',
      comment_id: comment_id
    },
    success: function(partial) {
      $('#comment-' + comment_id).hide();
      $('#comment-' + comment_id).before(partial);
      $('#comment-form-edit textarea').focus();      
    },
    error: function(error) {
      console.log(error);
      alert('Error: ' + error.responseText);
    }
  });
}

Thingiverse.Comment.reply_form = function(parent_id, event) {
  if (event) {
    event.preventDefault();
  }
  
  // remove any existing reply forms, prevents multiple forms if you click reply several times
  $('#comment-form-reply').remove();
  
  $.ajax({
    type: "GET",
    url: '/ajax/comments/_form',
    data: {
      form_type: 'reply',
      parent_id: parent_id
    },
    success: function(partial) {
      $('#comment-' + parent_id + '-children').prepend(partial);
      $('#comment-form-reply textarea').focus();
    },
    error: function(error) {
      console.log(error);
      alert('Error: ' + error.responseText);
    }
  });
}
