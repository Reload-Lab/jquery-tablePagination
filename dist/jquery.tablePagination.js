// JavaScript Document

(function($){
	
	$.fn.tablePagination = function()
	{
		var defaults,
			method,
			$subset,
			$this = this;
		
		// Html tags and css class
		var PAGES_TAG = '<ul>',
			PAGES_CLASS = 'pagination',
			CTRL_TAG = '<div>',
			CTRL_CLASS = 'ctrl-bar',
			COUNTPAGES_TAG = '<div>',
			COUNTPAGES_CLASS = 'pages-count',
			SELECTROWS_TAG = '<div>',
			SELECTROWS_CLASS = 'rows-select',
			LI_TAG = '<li>',
			LI_CLASS = 'page-item',
			ACTIVE_CLASS = 'active',
			DISABLED_CLASS = 'disabled',
			A_TAG = '<a>',
			A_CLASS = 'page-link',
			ARROWS_CLASS = 'page-arrow',
			ELLIPSIS_CLASS = 'page-ellipsis';
		
		// Default settings
		if(!arguments.length || $.isPlainObject(arguments[0])){
			
			defaults = $.extend({}, {
				subset: false, // Subset of rows (jQuery object)
				currentPage: 0, // Actual page
				numRowsPage: 10, // Num rows per page
				maxShowedPages: 10, // Max pages to show in control bar
				prev: '&lt;', // Prev text/html
				next: '&gt;', // Next text/html
				countText: '<b>[t]</b> record trovati - pagina <b>[x]</b> di <b>[y]</b>', // count pages template
				selectNumRowsPage: true, // Select enabled
				selectOptions: [10, 25, 50, 100] // Select options
			}, arguments[0]);
		} 
		
		// Method
		else if(typeof arguments[0] == 'string'){
			
			var method = arguments[0];
		}
		
		// Subset
		if(typeof arguments[1] == 'object' 
			&& arguments[1] instanceof jQuery
		){
			
			$subset = arguments[1]; 
		}

		this.each(function(index, domElement)
		{
			var that = this;
			
			// Init function
			that._init = function()
			{
				var $table = $(this), // html table
					id = $table.attr('id'), // table ID
					$cnt = $("[data-tp-target='#" + id + "']"); // control bar container
				
				// None ID or control bar container
				if(!id || $cnt.length == 0){
					
					return false;
				}
				
				// Set configuration in data attribute
				$table.data('tp', $.extend({}, defaults))
					.data('tpdef', defaults);
				
				// Append count pages to container
				$(COUNTPAGES_TAG).addClass(COUNTPAGES_CLASS)
					.appendTo($cnt);
				
				// Append control bar to container
				$ctrl = $(CTRL_TAG).addClass(CTRL_CLASS)
					.appendTo($cnt);
				
				// Append pagination to control bar
				$(PAGES_TAG).addClass(PAGES_CLASS)
					.appendTo($ctrl);
				
				// Append Select row per page to control bar
				$(SELECTROWS_TAG).addClass(SELECTROWS_CLASS)
					.appendTo($ctrl);
				
				// Bind custom event to $table
				$table.bind('paginate', function()
				{
					var $table = $(this), // html table
						id = $table.attr('id'), // table ID
						options = $table.data('tp'), // get configuration
						$cnt = $("[data-tp-target='#" + id + "']"); // control bar container
					
					// None ID or configuration or control bar container
					if(!id || !options || $cnt.length == 0){
						
						return false;
					}
					
					// Manage rows
					if(options.subset){
						
						options.subset
							.hide()
							.slice((options.currentPage * options.numRowsPage), ((options.currentPage + 1) * options.numRowsPage))
							.show();
					} else{
						
						$table.find('tbody tr')
							.hide()
							.slice((options.currentPage * options.numRowsPage), ((options.currentPage + 1) * options.numRowsPage))
							.show();
					}
					
					// SET COUNTER
					$cnt.find('.' + COUNTPAGES_CLASS)
						.html(options.countText
							.replace('[t]', options.numRows)
							.replace('[x]', (options.currentPage + 1))
							.replace('[y]', options.numPages)
						);
					
					// Call pages
					this._pages();
				});
				
				// Call load
				this._load();
			};
			
			// Load function
			that._load = function()
			{
				var $table = $(this), // html table
					id = $table.attr('id'), // table ID
					options = $table.data('tp'), // get configuration
					$cnt = $("[data-tp-target='#" + id + "']"); // control bar container
				
				// None ID or configuration or control bar container
				if(!id || !options || $cnt.length == 0){
					
					return false;
				}
				
				// Subset
				if($subset){
					
					options.subset = $subset; 
				}
	
				// Total rows
				if(options.subset){
					
					var numRows = options.subset.length;
				} else{
					
					var numRows = $table.find('tbody tr').length;
				}
				
				// Set numPages and numRows
				var options = $.extend(options, {
					numPages: Math.ceil(numRows / options.numRowsPage),
					numRows: numRows
				});
				
				// Empty control bar
				var $ctrl = $cnt.find('.' + PAGES_CLASS)
					.empty();
				
				// Correction if I delete rows
				if(options.currentPage > options.numPages - 1){
					
					options.currentPage = options.numPages - 1;
				}
				
				// Set configuration in data attribute
				$table.data('tp', $.extend({}, options));
				
				// Add select
				this._selection();
				
				// If total rows is major than num rows per page
				if(numRows > options.numRowsPage){
					
					// Show Select rows
					$cnt.find('.' + SELECTROWS_CLASS)
						.show();
					
					// Prev arrow
					var $a = $(A_TAG).addClass(A_CLASS)
						.attr('href', '#')
						.html(options.prev);
					
					$(LI_TAG).addClass(LI_CLASS + ' ' + ARROWS_CLASS + ' prev')
						.append($a)
						.on('click.tp', function(e){
							e.preventDefault();
							
							if(!$(this).hasClass(DISABLED_CLASS)){
								
								// Set new current page
								var newPage,
									state = {};
								var actualPage = $ctrl.find('.' + LI_CLASS + '.' + ACTIVE_CLASS);
								if((newPage = parseInt(actualPage.attr('data-tp-num')) - 2) >= 0){
									
									options.currentPage = newPage;
									
									// Set configuration in data attribute
									$table.data('tp', $.extend({}, options));
									
									// Set the state
									state[id] = options.currentPage + ',' + options.numRowsPage;
									$.bbq.pushState(state);
								}
								
								// Trig event
								$table.trigger('paginate');
							}
						})
						.appendTo($ctrl);
					
					// Pages number
					for(var page = 0; page < options.numPages; page++){
						
						var $a = $(A_TAG).addClass(A_CLASS)
							.attr('href', '#')
							.text(page + 1);
						
						$(LI_TAG).addClass(LI_CLASS)
							.attr('data-tp-num', page + 1)
							.append($a)
							.on('click.tp', function(e){
								e.preventDefault();
								
								// Set new current page
								if(!$(this).hasClass(DISABLED_CLASS)){
									
									var newPage,
										state = {};
									if((newPage = parseInt($(this).attr('data-tp-num')) - 1) >= 0){
										
										options.currentPage = state[id] = newPage;
										
										// Set configuration in data attribute
										$table.data('tp', $.extend({}, options));
										
										// Set the state
										state[id] = options.currentPage + ',' + options.numRowsPage;
										$.bbq.pushState(state);
									}
									
									// Trig event
									$table.trigger('paginate');
								}
							})
							.appendTo($ctrl);
					}
					
					// Next arrow
					var $a = $(A_TAG).addClass(A_CLASS)
						.attr('href', '#')
						.html(options.next);
					
					$(LI_TAG).addClass(LI_CLASS + ' ' + ARROWS_CLASS + ' next')
						.append($a)
						.on('click.tp', function(e){
							e.preventDefault();
							
							if(!$(this).hasClass(DISABLED_CLASS)){
								
								// Set new current page
								var newPage,
									state = {};
								var actualPage = $ctrl.find('.' + LI_CLASS + '.' + ACTIVE_CLASS);
								if((newPage = parseInt(actualPage.attr('data-tp-num'))) < options.numPages){
									
									options.currentPage = state[id] = newPage;
									
									// Set configuration in data attribute
									$table.data('tp', $.extend({}, options));
									
									// Set the state
									state[id] = options.currentPage + ',' + options.numRowsPage;
									$.bbq.pushState(state);
								}
							}
							
							// Trig event
							$table.trigger('paginate');
						})
						.appendTo($ctrl);
						
					// Ellipsis
					var $a = $(A_TAG).addClass(A_CLASS)
						.attr('href', '#')
						.text('...');
				
					$(LI_TAG).addClass(LI_CLASS + ' ' + ELLIPSIS_CLASS + ' prev ' + DISABLED_CLASS)
						.append($a)
						.insertAfter($ctrl.find('.' + ARROWS_CLASS + '.prev'));
				
					var $a = $(A_TAG).addClass(A_CLASS)
						.attr('href', '#')
						.text('...');
				
					$(LI_TAG).addClass(LI_CLASS + ' ' + ELLIPSIS_CLASS + ' next ' + DISABLED_CLASS)
						.append($a)
						.insertBefore($ctrl.find('.' + ARROWS_CLASS + '.next'));
				}
				
				// Trig event
				$table.trigger('paginate');
			};
			
			// Pages function
			that._pages = function()
			{
				var $table = $(this), // html table
					id = $table.attr('id'), // table ID
					options = $table.data('tp'), // get configuration
					$cnt = $("[data-tp-target='#" + id + "']"); // control bar container
				
				// None ID or configuration or control bar container
				if(!id || !options || $cnt.length == 0){
					
					return false;
				}
				
				$cnt.each(function(index, domElement)
				{
					$cnt = $(this);
					
					// Set active page
					$(this).find("." + LI_CLASS + "[data-tp-num]")
						.removeClass(ACTIVE_CLASS)
						.siblings("." + LI_CLASS + "[data-tp-num='" + (options.currentPage + 1) + "']")
						.addClass(ACTIVE_CLASS);
					
					// Hide ellipsis
					$(this).find('.' + ELLIPSIS_CLASS)
						.hide();
					
					// Manage pages to show
					if(options.maxShowedPages > 0 
						&& options.maxShowedPages < options.numPages
					){
						
						// Pages to show in control bar
						var show = options.maxShowedPages / 2;
						
						// Hide pages in control bar
						var $slide = $(this).find("." + LI_CLASS + "[data-tp-num]")
							.hide();

						// Show pages in control bar
						if((options.currentPage - show) < 0){

							$slide.slice(0, options.maxShowedPages)
								.show();
						} else if((options.currentPage + show) >= options.numPages){

							$slide.slice(options.numPages - options.maxShowedPages, options.numPages)
								.show();
						} else if((options.currentPage - show) >= 0 
							&& (options.currentPage + show) < options.numPages
						){

							$slide.slice((options.currentPage - Math.floor(show)), (options.currentPage + Math.ceil(show)))
								.show();
						}

						// Show prev ellipsis
						if($(this).find("." + LI_CLASS + "[data-tp-num='1']").is(':hidden')){
							
							$(this).find('.' + ELLIPSIS_CLASS + '.prev')
								.show();
						}
						
						// Show next ellipsis
						if($(this).find("." + LI_CLASS + "[data-tp-num='" + options.numPages + "']").is(':hidden')){
							
							$(this).find('.' + ELLIPSIS_CLASS + '.next')
								.show();
						}
					}
					
					// Manage arrows
					$(this).find('.' + ARROWS_CLASS)
						.removeClass(DISABLED_CLASS);
					
					if(options.currentPage == 0){
						
						$(this).find('.' + ARROWS_CLASS + '.prev')
							.addClass(DISABLED_CLASS);
					} else if(options.currentPage == (options.numPages - 1)){
						
						$(this).find('.' + ARROWS_CLASS + '.next')
							.addClass(DISABLED_CLASS);
					}
				});
			};
				
			// Select function
			this._selection = function()
			{
				var $table = $(this), // html table
					id = $table.attr('id'), // table ID
					options = $table.data('tp'), // get configuration
					$cnt = $("[data-tp-target='#" + id + "']"); // control bar container
				
				// None ID or configuration or control bar container
				if(!id || !options || $cnt.length == 0){
					
					return false;
				}

				if(options.selectNumRowsPage){
					
					// Select container
					var $selecter = $cnt.find('.' + SELECTROWS_CLASS)
						.empty()
						.hide();
					
					// Create select
					var $sel = $('<select>').addClass('form-control')
						.attr('title', 'Numero di record per pagina')
						.on('change.tp', function(e)
						{
							var num,
								state = {};
							
							if((num = parseInt($(this).val())) > 0){
								
								var righe = (options.currentPage * options.numRowsPage) + 1;
								var pagina = Math.ceil(righe / num) - 1;
								
								options.numRowsPage = num;
								options.currentPage = pagina;
								
								// Set configuration in data attribute
								$table.data('tp', $.extend({}, options));
								
								// Set the state
								state[id] = options.currentPage + ',' + options.numRowsPage;
								$.bbq.pushState(state);
								
								// Call load
								that._load();
							}
							
							return false;
							
						}).appendTo($selecter);
					
					// Create options
					$('<option value=""></option>').appendTo($sel);
					for(var i = 0; i < options.selectOptions.length; i++){
						
						$('<option value="' + 
							options.selectOptions[i] + '"' + 
							(options.numRowsPage == options.selectOptions[i]? ' selected': '') + 
							'>' + 
							options.selectOptions[i] + 
							'</option>').appendTo($sel);
					}
				}
			};
			
			// Call init
			if(defaults){
				
				this._init();
			}
			
			// Call method
			else if(method){
				
				switch(method){
					
					case 'reload':
						
						// Call load
						this._load();
					break;
				}
			}
		});
		
		// Bind an event to window.onhashchange that, 
		// when the history state changes,
		// iterates over all tables, 
		// getting their appropriate url from the
		// current state.
		$(window).bind('hashchange.pagination', function(e)
		{
			$this.each(function()
			{
				var $table = $(this), // html table
					id = $table.attr('id'), // table ID
					options = $table.data('tp'); // get configuration
				
				// None ID or configuration
				if(!id || !options){
					
					return false;
				}
				
				// Get the state
				var state = $.bbq.getState(id) || '';
				
				if(state != '' && state.indexOf(',') != -1){
					
					var parts = state.split(',', 2);
					
					if(options.currentPage == parts[0]
						&& options.numRowsPage == parts[1]
					){
						return;
					}
					
					options.currentPage = parseInt(parts[0]);
					options.numRowsPage = parseInt(parts[1]);
				} else{
					
					var def = $table.data('tpdef');
					
					options.currentPage = def.currentPage || 0;
					options.numRowsPage = def.numRowsPage || 10;
				}
				
				// Set configuration in data attribute
				$table.data('tp', $.extend({}, options));
				
				// Call load
				this._load();
			});
		});

		// Since the event is only triggered when the hash changes, we need to trigger
		// the event now, to handle the hash the page may have loaded with.
		$(window).trigger('hashchange.pagination');
		
		return $this;
	};
})(jQuery);