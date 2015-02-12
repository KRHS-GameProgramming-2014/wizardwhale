Thingiverse.Scroller = function(opts) {
  if (!opts || typeof opts !== 'object') {
    opts = {};
  }
  
  this.settings = $.extend(true, {}, this.defaultSettings, opts);
  
  this.init();
  
  return this;
};

Thingiverse.Scroller.prototype.defaultSettings = {
  'container': null,
  'source': null,
  'source_data': {},
  'minPage': 1, // first page is 1
  'maxPage': 1, // first page is 1
  'finalPage': false,
  'loading': false,
  'scrolling': null,
  'addButtons': true,
  'maxPages': 5,
  'backToTopHeight': 0,
  'autoScroll': true,
  'scrollContainer': $(window)
};

Thingiverse.Scroller.prototype.init = function() {
  var self = this;
  
  self.settings.backToTopHeight = self.settings.container.position().top;
  
  if (self.settings.addButtons) {
    $(self.createMoreButton()).insertBefore(self.settings.container);
    $(self.createMoreButton()).insertAfter(self.settings.container);
  }
  
  var $containerParent = self.settings.container.parent();
  self.settings.prevPageButton = $containerParent.find('.view-more').first();
  self.settings.prevPageStatus = $containerParent.find('.view-more-status').first();
  self.settings.nextPageButton = $containerParent.find('.view-more').last();
  self.settings.nextPageStatus = $containerParent.find('.view-more-status').last();

  if (self.settings.minPage <= 1) {
    self.settings.prevPageButton.addClass('hidden');
  }
  if (self.settings.finalPage && (self.settings.finalPage == self.settings.maxPage)) {
    self.settings.nextPageButton.addClass('hidden');
  }
  
  var scrollHandler = function(e) {
      var scrollTop = self.settings.scrollContainer.scrollTop();
      var scrollBottom = scrollTop + self.settings.scrollContainer.height();
      var nextMore = self.settings.nextPageButton.position().top-200;
      var prevMore = self.settings.prevPageButton.position().top;
      
      if (self.settings.autoScroll && !self.settings.loading) {
        if (scrollTop < prevMore && self.settings.minPage > 1) {
          self.prevPage();
          if (self.settings.scrolling) {
            self.settings.scrolling(self.settings.minPage);
          }
        }
        if (scrollBottom > nextMore && ((!self.settings.finalPage) || (self.settings.maxPage < self.settings.finalPage))) {
          self.nextPage();
          if (self.settings.scrolling) {
            self.settings.scrolling(self.settings.maxPage);
          }
        }
      }
  };
  
  self.settings.scrollContainer.scroll( $.debounce(250, scrollHandler));
  
  self.settings.nextPageButton.click(function(e){
    e.preventDefault();
    self.nextPage();
  });
  
  self.settings.prevPageButton.click(function(e){
    e.preventDefault();
    self.prevPage();
  });
  
  // mark the first element as the first page indicator.
  // if beyond page 1, insert a marker and adjust scrollTop.
  if(self.settings.minPage == 1) {
    var $marker = self.settings.container.find('> *:not(script):first');
    $marker.attr('data-page', self.settings.minPage);
  } else {
    var $marker = self.getMarker(self.settings.minPage);
    self.settings.container.prepend($marker);
    self.settings.scrollContainer.scrollTop(self.settings.container.position().top);
  }
};

Thingiverse.Scroller.prototype.nextPage = function() {
  var self = this;
  
  // Tracks loading for infinite scroll.  Don't want to rely on class names for that.
  self.settings.loading = true;
  self.settings.maxPage++;

  $(self.settings.nextPageButton).addClass('hidden');
  $(self.settings.nextPageStatus).removeClass('hidden');

  var submitData = _.extend(self.settings.source_data, {'page': self.settings.maxPage});
  $.ajax({
    'url': self.settings.source,
    'type': 'POST',
    'data': submitData,
    
    success: function(data, textStatus, jqXHR) {
      if (jQuery.trim(data).length) { // response has content
        var $content = self.markNewContent(data, self.settings.maxPage);
        $content.appendTo(self.settings.container);
        self.removeExtraPreviousPages();
        self.resetScrollWatchers();
        self.settings.container.trigger('makerbot.inserted');
        
        track_page(self.settings.source_data.base_url+'page:'+self.settings.source_data.page);
        if((!self.settings.finalPage) || (self.settings.maxPage < self.settings.finalPage)) {
          $(self.settings.nextPageButton).removeClass('hidden').text('View More');
        }
      } else {
        self.settings.maxPage--;
        self.settings.finalPage = self.settings.maxPage;
      }
      
      // Only unsetting loading in success so that scroll doesn't retry
      // on error.  You must click for that.
      self.settings.loading = false;
    },
    
    error: function() {
      self.settings.maxPage--;
      $(self.settings.nextPageButton).text('Something went wrong.  Try again?');
    },

    complete: function() {
      $(self.settings.nextPageStatus).addClass('hidden');
    }
  });
};

Thingiverse.Scroller.prototype.removeExtraPreviousPages = function () {
  var self = this;
  
  // get all page markers
  var markers = self.settings.container.find('[data-page]');
  if(markers.length > self.settings.maxPages) {
    var firstMarker = markers.slice(-self.settings.maxPages).first();
    var idx = firstMarker.index();
    // remove extra pages and adjust scroll
    var oldHeight = $(self.settings.container).height();
    var removed = $(self.settings.container).children().slice(0, idx).remove();
    var newHeight = $(self.settings.container).height();

    self.settings.scrollContainer.scrollTop(self.settings.scrollContainer.scrollTop() - (oldHeight - newHeight));
    // update page number
    self.settings.minPage = firstMarker.data('page');
    if(self.settings.minPage > 1) {
      self.settings.prevPageButton.removeClass('hidden').text('View More');
    }
  }
};

Thingiverse.Scroller.prototype.prevPage = function() {
  var self = this;
  
    // Tracks loading for infinite scroll.  Don't want to rely on class names for that.
    self.settings.loading = true;
    self.settings.minPage--;
    
    self.settings.prevPageButton.addClass('hidden');
    self.settings.prevPageStatus.removeClass('hidden');
    
    var submitData = _.extend(self.settings.source_data, {'page': self.settings.minPage});
    $.ajax({
      'url': self.settings.source,
      'type': 'POST',
      'data': submitData,
      
      success: function(data, textStatus, jqXHR) {
        if (jQuery.trim(data).length) {
          var $content = self.markNewContent(data, self.settings.minPage);
          var origHeight = self.settings.container.height();
          $content.prependTo(self.settings.container);
          var newHeight = self.settings.container.height();
          self.settings.scrollContainer.scrollTop(self.settings.scrollContainer.scrollTop() + (newHeight - origHeight));
          self.removeExtraNextPages();
          self.resetScrollWatchers();
          
          track_page(self.settings.source_data.base_url+'page:'+self.settings.source_data.page);
          
          if(self.settings.minPage > 1) {
            self.settings.prevPageButton.removeClass('hidden').text('View More');
          }
        }
        // Only unsetting loading in success so that scroll doesn't retry
        // on error.  You must click for that.
        self.settings.loading = false;
      },
      
      error: function() {
        self.settings.minPage++;
        self.settings.prevPageButton.text('Something went wrong.  Try again?');
      },
      
      complete: function() {
        self.settings.prevPageStatus.addClass('hidden');
      }
    });
};

Thingiverse.Scroller.prototype.removeExtraNextPages = function () {
  var self = this;
  
  // get all page markers
  var markers = self.settings.container.find('[data-page]');
  if(markers.length > self.settings.maxPages) {
    var lastMarker = markers.slice(0,self.settings.maxPages+1).last();
    var idx = lastMarker.index();
    var removed = $(self.settings.container).children().slice(idx).remove();
    // next page nav
    self.settings.maxPage = lastMarker.data('page') - 1;
    self.settings.nextPageButton.removeClass('hidden').text('View More');
  }
};

Thingiverse.Scroller.prototype.resetScrollWatchers = function() {
  var self = this;
  
  setTimeout(
      function() {
        Thingiverse.scrollMonitor.reset();
        self.settings.container.find('*[data-page]').each(function(i,e){
          Thingiverse.scrollMonitor.watchElement(
            $(e),
            {'callback': function(e){
              self.updatePageNum(e.element.data('page'));
            }}
          );
        });
      }, 100
    );
};

Thingiverse.Scroller.prototype.markNewContent = function (data, page) {
  var self = this;
  
  var $content = $(data);
  if(page == 1) {
    var $marker = $content.filter('div').first();
    $marker.attr('data-page', page);
  } else {
    var $marker = self.getMarker(page);
    $content = $.merge($marker, $content);
  }
  return $content;
};

Thingiverse.Scroller.prototype.getMarker = function (page) {
  var self = this;
  
  return $('<div />', {
      'class': 'inf-scroll-separator',
      'data-page': page,
      'html': '<span class=\'banner-wrap\'></span><span class=\'page-marker\'>Page ' + page + '</span>'
      });
};

Thingiverse.Scroller.prototype.updatePageNum = function(pageNum) {
  var self = this;
  
  if(history.replaceState) {
    var loc = document.createElement('a');
    loc.href = window.location.href;
    var args = loc.search;
    loc = loc.pathname;
    var prefix = ((isIE10)? '/' : '');

    var regex = /^(.*)\/page:([0-9])+/;
    if(regex.test(loc)) {
      var matches = regex.exec(loc);

        if(matches[2] != pageNum) {
        history.replaceState({'page':pageNum}, '', prefix +  matches[1] + '/page:' + pageNum + args);
        }
    }
    else {
        if(/\/$/.test(loc)) {
          loc = /^(.*)\//.exec(loc)[1];
        }
        history.replaceState({'page':pageNum}, '',  prefix + loc + '/page:' + pageNum + args);
    }
  }
};

Thingiverse.Scroller.prototype.createMoreButton = function() {
  var self = this;
  
  return $(
    "<div class='view-more'>View More</div>" +
    "<div class='view-more-status hidden'><img src='/img/ajax-loader.gif' /></div>"
  );
};