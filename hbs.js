const HbView = Marionette.Behavior.extend({
	loaded: false,
	initialize (options) {
		let HBTemplate = options.template || this.view.HBTemplate;

		this.view._loadTemplate = false;

		//Get path template
		if(!HBTemplate) return console.warn("HBTemplate is not defined");
		
		//Check cache obj
		if(App.tmpCache[HBTemplate] == undefined) {
			return App.tmpCache[HBTemplate] = App.ajax({
				type: 'GET',
				url: HBTemplate,
				dataType: 'text'
			}).then(resp => {
				//Add to cache
				if(!this.view.isDestroyed()) {
					App.tmpCache[HBTemplate] = resp;
					this.setTemplate(App.tmpCache[HBTemplate]);
					if(_.isFunction(this.view.onLoadTemplate)) this.view.onLoadTemplate(); 
					this.loaded = true;
				}

				return new Promise((resolve, reject) => resolve(resp));
			});
		}
		//Check current running Promise
		if(_.isFunction(App.tmpCache[HBTemplate].then)) {
			App.tmpCache[HBTemplate].then(resp => {
				//Add to cache
				App.tmpCache[HBTemplate] = resp;
				this.setTemplate(App.tmpCache[HBTemplate]);
					if(_.isFunction(this.view.onLoadTemplate) && !this.view.isDestroyed()) {
						this.view.onLoadTemplate();
					} 
				this.loaded = true;
			})
		//Template loaded, just set template
		} else {
			this.loaded = true;
			this.setTemplate(App.tmpCache[HBTemplate]);
		}
	},
	setTemplate (template) {
		let tmp = handlebars.compile(template);
		
		this.view.template = data => tmp(data);
		this.view._loadTemplate = true;
		this.view.triggerMethod('template:load');
	}
});

export default HbView
