(function(){
	var Game = window.Game = function(id){
		this.canvas = document.querySelector(id);
		this.ctx = this.canvas.getContext("2d");
		this.R = {};
		this.init();
	}

	Game.prototype.init = function(){
		var self = this;
		this.canvas.width = 377;
		this.canvas.height = 417;
		this.loadAllResources("R.json",function(){
			self.start();
			self.bindEvent();
			// 初始即为电脑走棋
			if(self.board.com == self.board.isPlayer){
				self.board.computerMove();
			}
		});
	}

	Game.prototype.start = function(){
		this.board = new Board();
		this.search = new Search();
		var self = this;
		
		//开启定时器
		setInterval(function(){
			self.ctx.clearRect(0,0,self.canvas.width,self.canvas.height);
			
			self.board.render();
			self.board.update();
		},20);
	}

	//读取资源
	Game.prototype.loadAllResources = function(file,callback){
		var xhr;
		var self = this;
		if(window.XMLHttpRequest){
			xhr = new XMLHttpRequest();
		} else {
			xhr = new ActiveXObject("Microsoft.XMLHTTP");
		}
		xhr.onreadystatechange = function(){
			if(xhr.status == 200 && xhr.readyState == 4){
				var result = JSON.parse(xhr.responseText);

				var images = result.images;
				var len = images.length;
				var count = 0;
				for(var i=0;i<len;i++){
					self.R[images[i]["name"]] = new Image();
					self.R[images[i]["name"]].src = images[i]["url"];
					self.R[images[i]["name"]].onload = function(){
						count++;
						var text = "正在加载 " + count + "/" + len + ",请稍后...";
						self.ctx.clearRect(0,0,self.canvas.width,self.canvas.height);
						self.ctx.textAlign = "center";
						self.ctx.font = "15px 微软雅黑";
						self.ctx.fillText(text,self.canvas.width / 2,self.canvas.height * (1 - 0.618));
						if(count >= len){
							console.log("加载完毕");
							callback && callback();
						}
					}	
				}
			}
		}
		xhr.open("get",file);
		xhr.send(null);
	}

	//绑定事件 0- 9.5 - 50.5  1- 49.5 - 90.5
	Game.prototype.bindEvent = function(){
		var self = this;
		this.canvas.onclick = function(event){
			//如果电脑正在思考，则不响应点击事件
			if(self.board.busy){
				return;
			}
			var mouseX = event.clientX ;
			var mouseY = event.clientY ;
			if(mouseX < 0 || mouseX > 365 || mouseY < 0 || mouseY > 405){
				return;
			}
			var pos = 51 + parseInt(mouseX / 41) + (parseInt(mouseY / 41) << 4);

			var pc = self.board.squares[pos]; // 点击的棋子
			if((pc & P.side_tag(self.board.isPlayer)) != 0){
				//点击了己方棋子
				if(self.board.sqSelected > 0){
					self.board.sqSelected = -1;
				}
				self.board.sqSelected = pos;
			} else if(self.board.sqSelected > 0){ // 如果点击的不是已方棋子，而且已经点击了一个棋子，那么说明此时可以走子
				self.board.addMove(P.move(self.board.sqSelected,pos));
				//轮到电脑走棋
				self.board.computerMove();
			}
			
		}
		this.canvas.onmousemove = function(event){
			if(self.board.busy){
				return;
			}
			var mouseX = event.clientX ;
			var mouseY = event.clientY ;
			if(mouseX < 0 || mouseX > 365 || mouseY < 0 || mouseY > 405){
				return;
			}
			self.board.move_piece = 51 + parseInt(mouseX / 41) + (parseInt(mouseY / 41) << 4);
		}
	}
})()