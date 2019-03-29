(function(){
	var Board = window.Board = function(){
		//用一行字符串表示一个局面，这就是FEN格式串
		this.fen = "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1";
		this.bgImage = game.R["MOVESKY"];
		//辅助数组，判断棋子是否在棋盘上（棋盘将扩展为16 * 16 的一维数组,0 不合法 1 为合法）
		this.IN_BOARD_ = [
			0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
			0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,
			0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,
			0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,
			0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,
			0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,
			0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,
			0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,
			0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,
			0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,
			0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,
			0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
		];
		//棋盘范围
		this.RANK_TOP = 3;
		this.RANK_BOTTOM = 12;
		this.FILE_LEFT = 3;
		this.FILE_RIGHT = 11;
		//棋子定义
		this.PIECE_KING = 0; //将
		this.PIECE_ADVISOR = 1; //士
		this.PIECE_BISHOP = 2; //象
		this.PIECE_KNIGHT = 3; //马
		this.PIECE_ROOK = 4; //车
		this.PIECE_CANNON = 5; //炮
		this.PIECE_PAWN = 6; //卒

		//对应的图片名称,红方 8 - 14 黑方 16 - 22
		this.PIECE_NAME = [
			"oo",null,null,null,null,null,null,null,
			"rk","ra","rb","rn","rr","rc","rp",null,
			"bk","ba","bb","bn","br","bc","bp",null
		];
		//第一次选中的棋子位置
		this.sqSelected = -1;
		//上一步走法
		this.mvLast = 0;
		//是否玩家走棋 0 红方 1 黑方
		this.isPlayer = 0;
		//移动到棋盘的位置
		this.move_piece = -1;
		this.init();
	};
	//初始化棋盘
	Board.prototype.init = function(){
		this.fromFen();
	}
	//更新棋盘
	Board.prototype.update = function(){
		//上一步有走棋，那么将给上一步走棋加上边框
		if(this.mvLast != 0){
			//画起点的边框
			var sqSrc = P.SRC(this.mvLast);
			var sqSrcX = this.rankX(sqSrc - 51) * 40 + 8;
			var sqSrcY = this.rankY(sqSrc - 51) * 40 + 8;
			var image = game.R[this.PIECE_NAME[this.squares[sqSrc]] + "s"];
			game.ctx.drawImage(image,sqSrcX,sqSrcY,41,41);

			//画终点的边框
			var sqDst = P.DST(this.mvLast);
			var sqDstX = this.rankX(sqDst - 51) * 40 + 8;
			var sqDstY = this.rankY(sqDst - 51) * 40 + 8;
			var image = game.R[this.PIECE_NAME[this.squares[sqDst]] + "s"];
			game.ctx.drawImage(image,sqDstX,sqDstY,41,41);
		}
		//本次选择了第一个棋子
		if(this.sqSelected > 0){
			var y = this.rankY(this.sqSelected - 51) * 40 + 8;
			var x = this.rankX(this.sqSelected - 51) * 40 + 8;
			var image = game.R[this.PIECE_NAME[this.squares[this.sqSelected]] + "s"];
			game.ctx.drawImage(image,x,y,41,41);
		}
		if(this.move_piece > 0){
			var y = this.rankY(this.move_piece - 51) * 40 + 8;
			var x = this.rankX(this.move_piece - 51) * 40 + 8;
			var image = game.R[this.PIECE_NAME[this.squares[this.move_piece]] + "s"];
			game.ctx.drawImage(image,x,y,41,41);
		}
		
	}
	//渲染棋盘
	Board.prototype.render = function(){
		game.ctx.drawImage(this.bgImage,0,0);
		for(var i=0;i<256;i++){
			if(this.inBoard(i)){
				var pc = this.squares[i];
				var image = game.R[this.PIECE_NAME[pc]];
				var y = this.rankY(i - 51) * 40 + 8;
				var x = this.rankX(i - 51) * 40 + 8;
				game.ctx.drawImage(image,x,y,41,41);
				
			}
		}
	}
	//
	//判断某位置是否在棋盘上
	Board.prototype.inBoard = function(sq){
		return this.IN_BOARD_[sq] != 0;
	}
	//根据一维矩阵，获取二维矩阵的行数
	Board.prototype.rankY = function(sq){
		return sq >> 4;
	}
	//根据一维矩阵，获取二维矩阵的列数
	Board.prototype.rankX = function(sq){
		return sq & 15;
	}
	//将二维矩阵，转换为一维矩阵
	Board.prototype.coord_XY = function(x,y){
		return x + (y << 4);
	}
	//初始化棋局数组
	Board.prototype.clearBoard = function(){
		this.squares = []; //一维棋局数组
		for(var i=0;i<256;i++){
			this.squares.push(0);
		}
	}
	//将棋子pc添加到棋局的sq位置中
	Board.prototype.addPiece = function(sq,pc){
		this.squares[sq] = pc;
	}
	//走一步棋
	Board.prototype.makeMove = function(mv){
		this.movePiece(mv);
		return true;
	}
	//根据走法移动棋子，删除终点位置的棋子，并将起点位置的棋子放到终点位置上
	Board.prototype.movePiece = function(mv){
		var sqSrc = P.SRC(mv); // 起点位置
		var sqDst = P.DST(mv); // 终点位置
		var pcSrc = this.squares[sqSrc]; //起点位置的棋子
		var pcDst = this.squares[sqDst]; //终点位置的棋子
		//起点位置的棋子置为 0 
		this.squares[sqSrc] = 0;
		//将起点位置的棋子，添加到终点位置
		this.addPiece(sqDst,pcSrc);
	}
	//判断这步棋是否合法，若合法，则执行这步棋
	Board.prototype.addMove = function(mv){
		//判断是否合法
		if(!P.isLegalMove(mv)){
			console.log("走棋不合法");
			return;
		}

		//执行这步棋
		if(!this.makeMove(mv)){
			return;
		}

		this.mvLast = mv;
		this.sqSelected = 0;
	}
	Board.prototype.fromFen = function(){
		//根据FEN串初始化棋局
		this.clearBoard();
		var y = this.RANK_TOP;
		var x = this.FILE_LEFT;
		var fen = this.fen;
		var index = 0;
		if(index == fen.length){
			return;
		}
		var c = fen.charAt(index);
		while(c != " "){
			if(c == "/"){//换行
				x = this.FILE_LEFT;
				y++;
				if(y > this.RANK_BOTTOM){
					break;
				}
			} else if (c >= "1" && c <= "9"){// 1-9 代表有几个空位
				x += (c.charCodeAt(0) - ("0").charCodeAt(0)); 
			} else if(c >= "A" && c <= "Z"){
				if(x <= this.FILE_RIGHT){
					var pt = this.char_to_piece(c);
					if(pt >= 0){
						this.addPiece(this.coord_XY(x,y),pt + 8);
					}
					x++;
				}
			} else if (c >= "a" && c <= "z") {
				if(x <= this.FILE_RIGHT){
					var pt = this.char_to_piece(String.fromCharCode(c.charCodeAt(0) + ("A").charCodeAt(0) - ("a").charCodeAt(0)));
					if(pt >= 0){
						this.addPiece(this.coord_XY(x,y),pt + 16);
					}
					x++;
				}
			}
			index ++;
			if(index == fen.length){
				return;
			}
			c = fen.charAt(index);
		}
		index ++;
		if(index == fen.length){
			return;
		}
	}

	Board.prototype.char_to_piece = function(c){
		switch(c){
			case "K":
				return this.PIECE_KING;
			case "A":
				return this.PIECE_ADVISOR;
			case "B":
				return this.PIECE_BISHOP;
			case "N":
				return this.PIECE_KNIGHT;
			case "R":
				return this.PIECE_ROOK;
			case "C":
				return this.PIECE_CANNON;
			case "P":
				return this.PIECE_PAWN;
			default:
				return -1;
		}
	}
})()