
Thingiverse.Printshop = function() {
}

// called on the printshop/edit page
Thingiverse.Printshop.initAdminPage = function() {
  $('ul.things').sortable();
  // on update, move a thing within a collection
  $('ul.things').on( "sortstop", function( event, ui ) {
    $.ajax({
      type: "POST",
      url: '/ajax/thingcollection/reorder_things',
      data: {
        id: ui.item.attr('value'),
        prev_id: ui.item.prev().attr('value'),
        next_id: ui.item.next().attr('value'),
      },
      complete: function(xhr){
        console.log(xhr.status+": "+xhr.responseText)
      },
      dataType: 'json'
    });
  });
}
// called on the printshop/edit page
Thingiverse.Printshop.initEditPage = function() {
  $('ul.renders').sortable();
  $('ul.images').sortable();
  // reorder all the images on update
  $('ul.images').on( "sortstop", function( event, ui ) {
    $.ajax({
      type: "POST",
      url: '/ajax/things/orderimages',
      data: {
        thing_id: document.getElementById('id').getAttribute('value'),
        image_ids: $('ul.images').sortable("toArray", {attribute:"value"}).filter(function(value) { return value; })
      },
      complete: function(xhr){
        console.log(xhr.status+": "+xhr.responseText)
      },
      dataType: 'json'
    });
  });
}

// save
Thingiverse.Printshop.save = function(form) {
  // odd... jQuery doesn't have a function to turn a form into an array?
  var formArray = $(form).serializeArray();
  var formData = {};
  for ( var i=0; i<formArray.length; i++ ) {
  if ( formArray[i]==undefined )
    continue;
  formData[formArray[i].name] = formArray[i].value;
  }
  // set our image_id
  if ( $('ul.renders') )
    formData['image_id'] = $('ul.renders').sortable("toArray", {attribute:"value"})[0];
  // submit the form
  $.ajax({
    type: "POST",
    url: $(form).attr('action'),
    data: formData,
    complete: function(xhr){
      console.log(xhr.status+": "+xhr.responseText)
      if ( xhr.status==200 )
        document.location = "/admin/printshop/explore";
    },
    dataType: 'json'
  });
}

// create new layout
Thingiverse.Printshop.createLayout = function() {
  var formData = {};
  formData['id'] = $('#id').val();
  formData['printer_id'] = $('#create_layout_printer_id').val();
  if ( $('ul.renders') )
    formData['object_id'] = $('ul.renders').sortable("toArray", {attribute:"file_id"})[0];
  if ( !formData['object_id'] )
  {
    alert( 'drag a model into the top-left box');
    return;
  }
  // submit the form
  $.ajax({
    type: "POST",
    url: "/ajax/printshopexplorethings/create_layout/",
    data: formData,
    complete: function(xhr){
      console.log(xhr.status+": "+xhr.responseText)
      if ( xhr.status==200 )
        document.location.reload();
    },
    dataType: 'json'
  });
}

// delete layout
Thingiverse.Printshop.deleteLayout = function(layout_id) {
  var formData = {};
  formData['layout_id'] = layout_id;
  $.ajax({
    type: "POST",
    url: "/ajax/printshopexplorethings/delete_layout/",
    data: formData,
    complete: function(xhr){
      console.log(xhr.status+": "+xhr.responseText)
      if ( xhr.status==200 )
        document.location.reload();
    },
    dataType: 'json'
  });
}

// make a file public ( used to publish slices )
Thingiverse.Printshop.makePublic = function(file_id) {
  var formData = {};
  formData['file_id'] = file_id;
  $.ajax({
    type: "POST",
    url: "/ajax/printshopexplorethings/publish_slice_file/",
    data: formData,
    complete: function(xhr){
      console.log(xhr.status+": "+xhr.responseText)
      if ( xhr.status==200 )
        document.location.reload();
    },
    dataType: 'json'
  });
}

// save a layout and reslice it
Thingiverse.Printshop.updateSlice = function(layout_id) {
  var shell_element = document.getElementById('layout_'+layout_id+'_shells');
  var infill_element = document.getElementById('layout_'+layout_id+'_infill');
  var print_data = new Object();
  if ( shell_element && shell_element.value!='' )
    print_data['shells'] = parseInt(shell_element.value);
  if ( infill_element && infill_element.value!='' )
    print_data['infill'] = parseFloat(infill_element.value);

  var formData = {};
  formData['layout_id'] = layout_id;
  formData['print_data'] = JSON.stringify(print_data);
  $.ajax({
    type: "POST",
    url: "/ajax/printshopexplorethings/update_slice/",
    data: formData,
    complete: function(xhr){
      console.log(xhr.status+": "+xhr.responseText)
      if ( xhr.status!=200 )
        alert('potential reslice error, check your log');
    },
    dataType: 'json'
  });
}


// render
Thingiverse.Printshop.render = function(object_id) {
  $.ajax({
    type: "POST",
    url: '/ajax/printshopexplorethings/printshop_render',
    data: {
      object_id: object_id,
    },
    complete: function(xhr){
      console.log(xhr.status+": "+xhr.responseText)
    },
    dataType: 'json'
  });

}
