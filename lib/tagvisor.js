/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * The Original Code is TelaSocial TagVisor
 *
 * The Initial Developer of the Original Code is Taboca TelaSocial.
 *
 * Contributor(s):
 * Marcio Galli <mgalli@taboca.com>
 */

var tv = { 

	currentTick : null, 
	playMode: false, 
	debug:false,
	counterSequential: 0,
	ticksSerialized: new Array(),
	viewWidth: null,
	viewHeight: null, 
        recordScale: 1,
	itemsByTicks: new Array(),
	sortedItems: new Array(),
        noScrollX:null, 
        noScrollY:null, 
	tickMode: true, 	
	dataStyle: ".slide { position:relative; }  ", 

	dumpTransform: function (property) { 
		return prop+";-ms-"+prop+";-webkit-"+prop+";-moz-"+prop+";-o-"+prop+";";
	},
	setup: function (viewportAttributes) { 
		viewWidth = document.body.clientWidth;
		viewHeight =  document.body.clientHeight;
		var dataStyle = this.dataStyle + "body { margin:0 } html { overflow:hidden; width:100%; height:100%; " + viewportAttributes + "} ";
		var inlinestyle = document.createElement('link');
		inlinestyle.setAttribute("rel","stylesheet");
		inlinestyle.setAttribute("href","data:text/css,"+ escape(dataStyle));
		document.getElementsByTagName("head")[0].appendChild(inlinestyle);
	}, 
	refreshView: function (d) { 
		this.viewLeft = d.documentElement.clientLeft;
		this.viewTop =  d.documentElement.clientTop;
		this.viewWidth = d.documentElement.clientWidth;
		this.viewHeight = d.documentElement.clientHeight;
	}, 
	sortArray: function (arr){
	  var sortedKeys = new Array();
	  var sortedObj = {};
	  for (var i in arr){
		sortedKeys.push(i);
	  }
	  sortedKeys.sort(this.sortNumber);
	  for (var i in sortedKeys){
		sortedObj[sortedKeys[i]] = arr[sortedKeys[i]];
	  }
	  return sortedObj;
	},

	sortNumber: function (a,b) {
		return a - b;
	},

	addElement:function (item) { 
		var time = item.getAttribute("data-time");
		if(time) { 
		if(time.indexOf("s")>-1) { 
			var secs = time.split("s")[0];
			// we use 2 ticks per sec
			var tickStamp = parseInt(secs*2); 
			this.itemsByTicks[tickStamp] = item; 
		} 
		} 
	} ,
	
	add:function (list) { 
		for(var i=0;i<list.length;i++) { 
			var item = list[i];
			var time = item.getAttribute("data-time");
			if(time) { 
			if(time.indexOf("s")>-1) { 
				var secs = time.split("s")[0];
				// we use 2 ticks per sec
				var tickStamp = parseInt(secs*2); 
				this.itemsByTicks[tickStamp] = item; 
			} 
			} 
		} 	
	} ,
	
	play: function () { 
		if(this.playMode==false) {
			this.setup();
		}  
		var these = this; 
		setTimeout(function () { these.startPlay() }, 500); 
 
	},
  
	startPlay: function () { 
		this.playMode=true; 
		this.sortedItems = this.sortArray(this.itemsByTicks);
		var i=0;
		for (key in this.sortedItems) { 
			this.ticksSerialized[i]=key;
			i++;
		} 
		this.ticksSerialized[i]=-1;
		this.currentTick=0;
		this.counterSequential=0;
		this.tick(1);
	},

	tick: function (dir) { 
		if(this.playMode) { 
			try { 
				if(!this.tickMode) { 
					if(dir==1) this.counterSequential++;
					if(dir==-1) this.counterSequential--;
				} 
				var nextTick = this.ticksSerialized[this.counterSequential];
				if(nextTick > -1) {
					if(nextTick==this.currentTick || this.tickMode == false) { 
						if(this.tickMode == false ) { 
							this.currentTick = nextTick;
						} 
						var lookUpElement = this.itemsByTicks[this.currentTick];
						if(lookUpElement) {  

							var currDoc = document;	
							if(lookUpElement.getAttribute("data-scope")) { 
								var sp = lookUpElement.getAttribute("data-scope").split(" ");
		
								for(var i=0;i<sp.length;i++) { 
									var newDoc = currDoc.getElementById(sp[i]).contentDocument; 
									if(newDoc) { 
										currDoc=newDoc;
									} 
								} 
				
							} 
							
							var targetElement = currDoc.getElementById(lookUpElement.getAttribute("data-target"));
							var fCommand ="";

							fCommand = lookUpElement.getAttribute("data-exec"); 

							if(fCommand!=null) { 
							if(fCommand.indexOf('dispatch')>-1) { 
try { 
								var str = fCommand.split("dispatch_load('"); 
								var str1 = str[1].split("'");
								var url = str1[0];
								targetElement.src=url+"?"+Math.random();
} catch (i) {  } 
							} 
							} 

							var fEffect = null; 
							var fDuration = null;
							try { fEffect = lookUpElement.getAttribute("data-effect"); } catch (i) { } 
							try { fDuration = lookUpElement.getAttribute("data-duration"); } catch(i) { } 
							var dur = 2;
							if(fDuration != null) { 
								dur=parseInt(fDuration);	
							} 
							if(fEffect == 'scalefit') { 
								this.effects_scale(targetElement,dur, currDoc);
							} 
							if(fEffect == 'end') { 

							        currDoc.documentElement.setAttribute("style",";overflow:auto;width:auto;height:auto");
	 				       			currDoc.body.setAttribute("style","");
								this.playMode = false;
							}
							if(fEffect == "fadeout") { 
								this.effects_fadeOut(targetElement,dur);
							} 
							if(fEffect == "flip3d") { 
								this.effects_flip3d(targetElement,dur);
							} 
							if(fEffect == "move") { 
								this.effects_animateNext(targetElement, currDoc,dur, false);
							} 
							if(fEffect == "movecenter") { 
								this.effects_animateNext(targetElement, currDoc,dur, true);
							} 
							if(this.tickMode )  { 
								this.counterSequential++;
							} 
						} 
					} 
					if(this.tickMode) { 
						this.currentTick++;
					} 
					var stampThis = this; 
					if(this.tickMode) { 
						setTimeout(function () { stampThis.tick(1) } ,500); 
					} 
				} else { 
					//end
				} 
	
			} catch (i) { 
				if(this.tickMode) this.currentTick++;  
				this.currentTick++;
				var stampThis = this; 
				setTimeout(function () { stampThis.tick(1) } ,500); 
			}
		} 
	} ,

	offset: function (domElement) {
	        if(!domElement) domElement = this;
	        var x = domElement.offsetLeft;
	        var y = domElement.offsetTop;
	        while (domElement = domElement.offsetParent) {
	                x += domElement.offsetLeft;
	                y += domElement.offsetTop;
	        }
        	return { left: x, top: y };
	},
	
	effects_fadeOut: function (el, t) { 
	        el.setAttribute("style","-moz-transition-property: opacity; -moz-transition-duration:"+t+"s;opacity:0");
	},

	effects_flip3d: function (el, t) { 
	        var moz = "-moz-transition-property: -moz-transform; -moz-transition-duration:"+t+"s;-moz-transform: perspective( 400px ) rotateY(360deg);"
	        var webkit = "-webkit-transition-property: -webkit-transform; -webkit-transition-duration:"+t+"s;-webkit-transform: perspective( 400px ) rotateY(360deg);"
	        el.setAttribute("style", moz + webkit);
	},

	effects_scale: function (a, t, d) { 

		var x = 0; 
		var y = 0;
		var center = true;
		this.refreshView(d); 
		var el = this.offset(a);

		if(!center) { 
			var x= el.left - this.viewLeft;
			var y= el.top - this.viewTop;
		} else { 
			var x= el.left - this.viewLeft - parseInt((this.viewWidth - parseInt(a.offsetWidth))/2);	
			var y= el.top - this.viewTop - parseInt((this.viewHeight - parseInt(a.offsetHeight))/2);	
		} 
	        d.body.setAttribute("style","-moz-transition-property: -moz-transform; -moz-transform:translate("+-1*x+"px,"+-1*y+"px); -moz-transition-duration:"+t+"s; -webkit-transition-property: -webkit-transform; -webkit-transform:translate("+parseInt(-1*x)+"px,"+parseInt(-1*y)+"px); -webkit-transition-duration:"+t+"s; -o-transition-property: -o-transform; -o-transform:translate("+parseInt(-1*x)+"px,"+parseInt(-1*y)+"px); -o-transition-duration:"+t+"s;");

		var el = this.offset(a);
		var sW = this.viewWidth/a.offsetWidth;
		var sH = this.viewHeight/a.offsetHeight;

		var sC = 0;
	
			var x= el.left;	
			var y= el.top;	

		var probeHeight = a.offsetHeight*sW;
		if(probeHeight<=this.viewHeight) { 
			sC = sW ;
			this.recordScale = a.offsetWidth/this.viewWidth;
		} 
		else { 
		 sC = sH;
		 this.recordScale = a.offsetHeight/this.viewHeight;
		} 
	        var str =   "-moz-transition-property: -moz-transform, -moz-transform-origin; -moz-transition-duration:"+t+"s;-moz-transform:scale("+sC+");";
	        str += "-webkit-transition-property: -webkit-transform, -webkit-transform-origin; -webkit-transition-duration:"+t+"s;-webkit-transform:scale("+sC+");";
	        str += "-o-transition-property: -o-transform, -o-transform-origin; -o-transition-duration:"+t+"s;-o-transform:scale("+sC+");";
	        d.documentElement.setAttribute("style",str);
	},
	effects_animateNext: function (a,d,t,center) { 

		var el = this.offset(a);
		var x = 0; 
		var y = 0;
		this.refreshView(d);
		if(!center) { 
			var x= el.left - this.viewLeft;
			var y= el.top - this.viewTop;
		} else { 
			var x= el.left - this.viewLeft - parseInt((this.viewWidth - parseInt(a.offsetWidth))/2);	
			var y= el.top - this.viewTop - parseInt((this.viewHeight - parseInt(a.offsetHeight))/2);	
		} 
		var ww = a.offsetWidth;
		var www = window.innerWidth;		        
	        var scale = www/(ww+800);
		x-=0;
	        d.getElementById("pagetranslate").setAttribute("style","-moz-transition-property: -moz-transform; -moz-transform:translate("+-1*x+","+-1*y+"); -moz-transition-duration:"+t+"s; -webkit-transition-property: -webkit-transform; -webkit-transform:translate("+parseInt(-1*x)+"px,"+parseInt(-1*y)+"px); -webkit-transition-duration:"+t+"s; -o-transition-property: -o-transform; -o-transform:translate("+parseInt(-1*x)+"px,"+parseInt(-1*y)+"px); -o-transition-duration:"+t+"s;");
	} 
} 
