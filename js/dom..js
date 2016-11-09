var IS_ANDROID = -1 < navigator.userAgent.indexOf("Android");
//window.money = wallmoneyJson ;
var _cfg = {
	//startFun: mainStage,
	img: {
		path: "images/wallMoney/game/",
		manifest: [{
			src:"m0.png",
			id: "m0"
		},
		{
			src: "mb0.png",
			id: "mb0"
		},
		{
			src: "d0.png" ,
			id: "d0"
		},
		{
			src: "starttip.png",
			id: "starttip"
		},
		
		]
	},
	audio:{
		path: "amountMoney/",
		manifest: [
			{id:'sound',src:'count.mp3'}
		]
	}
};
var playConfig = {
	noStateFn :function(callback){

	}
};
(function(){
	function MoneyApp(playConfig,conf){
		this.config = {
			W:document.documentElement.clientWidth ,
			H : document.documentElement.clientHeight,
			movLg : 5, //可以移动的钱

			bgObj : 5, //背景旋转的钱
			bgPoint : 5 , 	//背景旋转的指针


			lineSpac : 20,		//行间距
			columnSpac : 30,	//列间距	
			grolTop : 150,
		};

		this.playConfig = playConfig;
		this.files = conf;		//图片资源配置
		this.score = 0;					//记录分数
		this.configPlayTime = 5;				//活动时间30s
		this.playTime = this.configPlayTime;


		this.ingBgFlow = [];			//进行中 背景飘的钱
		this.ingBgInterval = 0;			//进行中 背景飘的钱的频率

		this.moveObj = [];				//可以向上移动的集合
		this.movePoint = 0;				//向上移动的指针

		this.eventObj = {};				//记录鼠标的位置
		this.arrowObj = {};				//记录鼠标移动

		this.arrowTop = false;			//是否向上移
		
		this.loadFile();
	}
	MoneyApp.prototype.loadFile = function(){
		var _this = this;
		this.queue = new createjs.LoadQueue(false);
		this.queue.setMaxConnections(30);
		this.queue.installPlugin('createjs.Sound');
		this.queue.on('complete',function(){
			_this.ready();
		},null,true);
		this.files.img && this.queue.loadManifest(this.files.img,false);
		
		/*加载声音*/
		/*IS_ANDROID ? this.queue.loadFile({
			id: "sound",
			src: "amountMoney/count.mp3"
		}) : (
			this.queue.loadFile({
				id:'sound',
				src:'amountMoney/count.mp3'
			})
		);
*/

		this.queue.loadManifest(this.files.audio,false);		
		this.queue.load();
	}
	MoneyApp.prototype.ready = function(){
		var _this = this;
		console.log('加载完毕了额');
		console.log(this);
		document.getElementById('canvas').width = this.config.W ;
		document.getElementById('canvas').height = this.config.H ;
		setTimeout(function(){
			_this.init();	
		},1000);
		
	}
	MoneyApp.prototype.init = function(){
		var _this = this;
		this.stage = new createjs.Stage('canvas');
		createjs.Ticker.setFPS(3000);
		
		if (IS_TOUCH = createjs.Touch.isSupported()) {
			createjs.Touch.enable(this.stage, false);		//设置touch
			//this.stage.mouseEnabled = !1;				//是否设置鼠标交互
		}
		createjs.Ticker.on("tick", this.stage);
		/*背景设置*/
		var bg = new createjs.Shape();
		bg.graphics.beginFill('#559966').drawRect(0,0,this.config.W,this.config.H);
		this.stage.addChild(bg);

		this.noState();
	}
	MoneyApp.prototype.enterInit = function(){
		//活动未开始的时候

	}
	MoneyApp.prototype.noState = function(){
		this.playTime = this.configPlayTime;
		this.moveObj = [];
		this.ingBgFlow = [];
		console.log(this.playTime);
		this.ingInit();

		var _this = this;
		this.notState = new createjs.Container();
		this.notState.visible = true;
		var hitArea = new createjs.Shape();
		console.log(this.config.W,this.config.H);
		hitArea.graphics.beginFill('#000000').drawRect(0,0,this.config.W,this.config.H);
		this.notState.hitArea = hitArea;

		var name = new createjs.Text('大家来数钱','20px Arial','#ffffff');
		name.regX = name.getBounds().width/2;
		name.x = this.config.W/2;
		name.y = 50;
		this.notState.addChild(name);

		console.log(this.config.H)

		var bottomBit = new createjs.Bitmap( this.queue.getResult('mb0') );
		bottomBit.regX = bottomBit.getBounds().width/2;
		bottomBit.x = this.config.W/2;
		bottomBit.y = this.config.H-this.config.grolTop;
		bottomBit.scaleX = 0.5;
		bottomBit.scaleY = 0.5;
		this.notState.addChild(bottomBit);

		var arrow = new createjs.Bitmap( this.queue.getResult('starttip') );
		arrow.regX = arrow.getBounds().width/2;
		console.log(arrow.getBounds().width);
		arrow.x = this.config.W -20;
		arrow.y = this.config.H-this.config.grolTop-120;
		arrow.scaleX = 0.5;
		arrow.scaleY = 0.5;
		this.notState.addChild(arrow);

		

		this.stage.addChild(this.notState);

		this.notState.on('mousedown',function(e){
			_this.eventObj = {
				x:e.stageX,
				y:e.stageY
			}
		});
		this.notState.on('pressup',function(e){
			var arrowTop = e.stageY;
			if(_this.eventObj.y - arrowTop > 50){
				_this.playing();
			}
		});
	}
	MoneyApp.prototype.ingInit = function(){

		var _this = this;
		this.stateIng = new createjs.Container();
		this.stateIng.visible = false;

		//创建操作区域
		var mouseZore = new createjs.Shape();
		mouseZore.graphics.beginFill('#000000').drawRect(0,_this.config.H*0.5,this.config.W,this.config.H);
		this.stateIng.hitArea = mouseZore;
		/*添加背景飘动的钱*/
		for(var i=0; i<this.config.bgObj; i++){
			var rotateBg = new createjs.Bitmap( this.queue.getResult('d0') );
			rotateBg.regX = rotateBg.getBounds().width/2;
			rotateBg.regY = rotateBg.getBounds().height/2;
			rotateBg.x = genRandom(this.config.W);
			rotateBg.visible = false;
			this.stateIng.addChild( rotateBg )	;
			this.ingBgFlow.push( rotateBg );
		}

		var bottomBit = new createjs.Bitmap( this.queue.getResult('mb0') );
		bottomBit.regX = bottomBit.getBounds().width/2;
		bottomBit.x = this.config.W/2;
		bottomBit.y = this.config.H-this.config.grolTop-50;
		bottomBit.scaleX = 0.5;
		bottomBit.scaleY = 0.5;
		this.stateIng.addChild(bottomBit);

		//添加移动的钱
		for(var i=0; i<this.config.movLg; i++){
			var moveBit = new createjs.Bitmap( this.queue.getResult('m0') );
			moveBit.regX = moveBit.getBounds().width/2;
			moveBit.x = this.config.W/2;
			moveBit.y = this.config.H-this.config.grolTop-150;
			moveBit.scaleX = 0.5;
			moveBit.scaleY = 0.5;
			moveBit.visible = false;
			this.stateIng.addChild(moveBit);
			this.moveObj.push(moveBit);
		}
		
		this.playTimeTite = new createjs.Text(this.playTime+'秒','20px Arial','#ffffff');
		this.playTimeTite.regX = this.playTimeTite.getBounds().width/2;
		this.playTimeTite.x = this.config.W/2;
		this.playTimeTite.y = 20;
		this.stateIng.addChild(this.playTimeTite);

		var playTite = new createjs.Text(this.score+'元','40px Arial','#ffffff');
		playTite.regX = playTite.getBounds().width/2;
		playTite.x = this.config.W/2;
		playTite.y = 40;
		this.stateIng.addChild(playTite);
		this.scortHd = playTite;



		this.stage.addChild(this.stateIng);

		this.ingBgInterval = setInterval(function(){
			_this.ingRotting();
		},1500);
		/*开启时间倒计时*/
		function downtime (){
			_this.playTime --;
			_this.playTimeTite.text = _this.playTime + '秒';
			if(_this.playTime >0){
				setTimeout(function(){
					downtime();
				},1000)
			}else{
				clearInterval(_this.ingBgInterval);
				_this.playEnd();
			}
		}
		setTimeout(function(){downtime()},1000);
	
		this.stateIng.on('mousedown',function(e){
			_this.eventObj = {
				x:e.stageX,
				y:e.stageY
			}
			_this.movePoint = _this.movePoint+1 >=_this.config.movLg ?0:_this.movePoint+1;
		});
		this.stateIng.on('pressmove',function(e){
			_this.arrowTop = e.stageY < _this.eventObj.y

			_this.moveObj[_this.movePoint].visible = true;
			_this.moveObj[_this.movePoint].y = e.stageY;
		});
		this.stateIng.on('pressup',function(e){
			if( _this.arrowTop && _this.eventObj.y - e.stageY >100 ){
				createjs.Tween.get( _this.moveObj[_this.movePoint] ).to({
					y:-_this.config.H
				},300).to({
					y:_this.config.H-_this.config.grolTop,
					visible : false
				},0);
				_this.score += 10;
				
				_this.scortHd.text = _this.score + '元';
				_this.scortHd.regX = _this.scortHd.getBounds().width/2;

				

			}else{
				createjs.Tween.get( _this.moveObj[_this.movePoint] ).to({
					y:_this.config.H-_this.config.grolTop-150,
					visible : false
				},0);
			} 	
		});
		
	}
	MoneyApp.prototype.playing = function(){
		this.notState.visible = false;
		this.stateIng.visible = true;
	}
	MoneyApp.prototype.playEnd = function(){
		this.stateIng.visible = false;

		this.stateEnd = new createjs.Container();
		this.stateEnd.visible = true;

		var endTime = new createjs.Text('游戏结束!','40px arial','#fff');
		endTime.regX = endTime.getBounds().width/2;
		endTime.x = this.config.W/2;
		endTime.y = 80;
		this.stateEnd.addChild(endTime);

		var scoreCont = new createjs.Text('你数了'+this.score+'元','30px arial','#fff');
		scoreCont.regX = scoreCont.getBounds().width/2;
		scoreCont.x = this.config.W/2;
		scoreCont.y = 140;
		this.stateEnd.addChild(scoreCont);

		var noteCont = new createjs.Text('你的钱少吗？不满意吗？', '24px arial','#fff');
		noteCont.regX = noteCont.getBounds().width/2;
		noteCont.x = this.config.W/2;
		noteCont.y = 240;
		this.stateEnd.addChild(noteCont);

		var again = new createjs.Text('再来一次','30px arial','yellow');
		again.regX = again.getBounds().width/2;
		again.x = this.config.W/2;
		again.y = 320;

		var bitZore = new createjs.Shape();
		bitZore.graphics.beginFill('#000000').drawRect(-(this.config.W/2-again.getBounds().width/2),0,this.config.W,again.getBounds().height);
		again.hitArea = bitZore;

		this.stateEnd.addChild(again);

		this.stage.addChild(this.stateEnd);
		var _this = this;
		again.on('click',function(){
			console.log(3333);
			_this.stateEnd.visible = false;
			_this.noState();
		})
	}

	MoneyApp.prototype.ingRotting = function(){
		
		var _this = this;
		for(var i=0; i<this.config.bgObj; i++){
			var obj = this.ingBgFlow[i];
			obj.visible = true;
			createjs.Tween.get(obj).to({
				x : genRandom(_this.config.W)+_this.config.columnSpac,
				y : this.config.H + obj.regY,
				rotation :700 + genRandom(360),
				scaleX:0.5,
				scaleY:0.5
			},500+genRandom(1000)).to({
				visible : false
			},0).to({
				y:-obj.regY,
				x:genRandom(_this.config.W),
				rotation : 0,
				scaleX : 1,
				scaleY : 1
			},0);
		}
	}
	MoneyApp.prototype.playEnded = function(){
		createjs.Ticker.removeAllEventListeners();
	}
	function genRandom(a){
		return parseInt( Math.random() * a );
	}
	return window.moneyPlay = new MoneyApp(playConfig,_cfg);
})();

window.onerror = function(msg,file,line){

	alert(msg)
	alert(file);
	alert(line)
}