/**
 * 验证棋子走法
 */
(function(){
	var P = window.P = {
		//判断将棋是否合法的辅助数组
		IN_FORT_: [
			0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,
			0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,
			0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,
			0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,
			0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
		],

		//获取红子还是黑子 （红子是 8，黑子是16）(红方回合为0，黑方都回合为1)
		side_tag: function(sd){
			return 8 + (sd << 3);
		},
		//获取对方的红黑标记
		opp_side_tag: function(sd){
			return 16 - (sd << 3);
		},
		/**
		 * 由于sqSrc 和 pcDst都是不超过255的数，所以可以将其压缩为一个数
		 * @param   sqSrc [棋子起点]
		 * @param   sqDst [棋子终点]
		 * @return [将起点和终点压缩成一个数]
		 */
		move: function(sqSrc,sqDst){
			return sqSrc + (sqDst << 8);
		},
		/**
		 * 获取走法的起点
		 * @param {[type]} mv [description]
		 */
		SRC: function(mv){
			return mv & 255;
		},
		/**
		 * 获取走法的终点
		 * @param {[type]} mv [description]
		 */
		DST: function(mv){
			return mv >> 8;
		},
		/**
		 * 判断将棋是否在九宫
		 */
		isIn_Fort: function(sq){
			return this.IN_FORT_[sq] != 0
		},
		/**
		 * 将 棋走法，要在九宫格内
		 * 起点 sqSrc ,可走棋子的位置为 sqSrc - 16 / sqSrc -1 / sqSrc + 1 / sqSrc + 16
		 */
		KING_SPAN: function(sqSrc,sqDst){
			return (sqDst - sqSrc) == -16 || (sqDst - sqSrc) == -1 ||
					(sqDst - sqSrc) == 1 || (sqDst - sqSrc) == 16;
		},
		/**
		 * 士棋走法，可走棋子位置为 sqSrc - 17 / sqSrc - 15 / sqSrc + 15 / sqSrc + 17
		 * 并且需要在九宫格内
		 */
		ADVISOR_SPAN: function(sqSrc,sqDst){
			return (sqDst - sqSrc) == -17 || (sqDst - sqSrc) == -15 ||
					(sqDst - sqSrc) == 15 || (sqDst - sqSrc) == 17;
		},
		/**
		 * 象 棋走法：不能过河 、 可走棋子位置为 sqSrc - 34 / sqSrc - 30 / sqSrc + 30 / sqSrc + 34
		 * 起点和终点不能有棋子
		 */
		BISHOP_SPAN: function(sqSrc,sqDst){
			return (sqDst - sqSrc) == -34 || (sqDst - sqSrc) == -30 ||
					(sqDst - sqSrc) == 30 || (sqDst - sqSrc) == 34;
		},
		/**
		 * 是否过河: 若起点是 0 - 127 中，则二进制的右数第八位必然为 0 ；若终点在 128 - 255内，则第八位必然是 1
		 * 因此，若终点和起点是同一边，则 sqSrc ^ sqDst 的第八位 为 0；
		 */
		SAME_HALF: function(sqSrc,sqDst){
			return ((sqSrc ^ sqDst) >> 7) == 0;
		},
		/**
		 * 象的另外两个走法合法，则返回象眼位置
		 */
		BISHOP_PIN: function(sqSrc,sqDst){
			return (sqSrc + sqDst) >> 2;
		},
		/**
		 * 马 棋有八个方向的棋子可走: 
		 * sqSrc - 33 / sqSrc - 31 / sqSrc - 18 / sqSrc - 14 / sqSrc + 14 / sqSrc + 18 / sqSrc + 31 / sqSrc + 33
		 * 对应的马脚分别是 sqSrc - 16 / sqSrc - 1 / sqSrc + 1 / sqSrc +16
		 * 假设可以从起点走到终点，那么返回马脚的位置，通过判断马脚位置是否有棋子来最终判定走法是否合法
		 */
		KNIGHT_PIN: function(sqSrc,sqDst){
			switch(sqDst - sqSrc){
				case -33:
				case -31:
					return sqSrc - 16;
				case -18:
				case -14:
					return sqSrc - 1;
				case 14:
				case 18:
					return sqSrc + 1;
				case 31:
				case 33:
					return sqSrc + 16;
				default:
					return 0;
			}
		},
		//判断起点和终点是否同一行 起点和终点可能的点 为00110000 - 11001111，同一行的数中，第5-8位是一致的 
		SAME_RANK: function(sqSrc,sqDst){
			return (((sqSrc ^ sqDst) & 0xf0) == 0);
		},
		//判断起点和终点是否同一列 ,同一列的数中，第1-4位是一致的
		SAME_FILE: function(sqSrc,sqDst){
			return (((sqSrc ^ sqDst) & 0x0f) == 0);
		},
		//判断 兵棋 前进位置,红方是-16，黑方是 +16
		isForward: function(sqSrc){
			return sqSrc - 16 + (game.board.isPlayer << 5);
		},
		//判断 兵棋是否过河,红棋过河时，棋子位置的第八位 为 0 ；黑棋过河时，第八位 为 1
		away_river: function(sqSrc){
			return (sqSrc >> 7) == game.board.isPlayer;
		},
		//判断走法是否合法
		isLegalMove: function(mv){
			var sqSrc = this.SRC(mv); // 走的起点
			var pcSrc = game.board.squares[sqSrc]; //起点棋子
			console.log(sqSrc ,pcSrc);
			var pcSelfSide = this.side_tag(game.board.isPlayer); //8 红子(0) 16 黑子(1) 
			if((pcSrc & pcSelfSide) == 0){
				//说明起始位置不是本方的棋子
				return false;
			}
			var sqDst = this.DST(mv); // 终点
			var pcDst = game.board.squares[sqDst];
			if((pcDst & pcSelfSide) != 0){
				//终点为本方棋子
				return false;
			}
			switch(pcSrc - pcSelfSide){
				case game.board.PIECE_KING: //将棋
					return this.isIn_Fort(sqDst) && this.KING_SPAN(sqSrc,sqDst);
				case game.board.PIECE_ADVISOR:  //士棋
					return this.isIn_Fort(sqDst) && this.ADVISOR_SPAN(sqSrc,sqDst);
				case game.board.PIECE_BISHOP: //象棋
					return this.SAME_HALF(sqSrc,sqDst) && this.BISHOP_SPAN(sqSrc,sqDst) &&
							game.board.squares[this.BISHOP_PIN(sqSrc,sqDst)] == 0;
				case game.board.PIECE_KNIGHT: //马棋
					var sqPin = this.KNIGHT_PIN(sqSrc,sqDst);
					return sqPin >0 && sqPin != sqSrc && game.board.squares[sqPin] == 0;

				case game.board.PIECE_ROOK: // 车
				case game.board.PIECE_CANNON: //炮
					var delta; //标识行走的方向 (+-1:左右走 +-16 上下走)
					if(this.SAME_RANK(sqSrc,sqDst)){
						//同一行
						delta = (sqDst > sqSrc) ? 1 : -1;
					} else if(this.SAME_FILE(sqSrc,sqDst)){
						//同一列
						delta = (sqDst > sqSrc) ? 16 : -16;
					} else {
						//不在同一行，同一列
						return false;
					}
					//沿着delta方向走棋，直到走到终点或者遇到了己方或他方的棋子
					var sqPin = sqSrc + delta;
					while(sqPin != sqDst && game.board.squares[sqPin] == 0){
						sqPin += delta;
					}
					if(sqPin == sqDst){//说明起点到终点，没有遇到棋子
						//对车来说，此时一定合法，对炮来说，如果终点没有棋子时合法
						return pcDst == 0 || pcSrc - pcSelfSide == game.board.PIECE_ROOK;
					}
					//从起点到终点时，有经过棋子，则 棋子必须为炮，且终点必须为对方棋子,否则必定不合法
					if(pcDst == 0 || pcSrc - pcSelfSide != game.board.PIECE_CANNON){
						return false;
					}
					//如果棋子为炮，且终点为对方棋子，则要查看中间是否只经过了一个棋子
					sqPin += delta;
					while(sqPin != sqDst && game.board.squares[sqPin] == 0){
						sqPin += delta;
					}
					return sqPin == sqDst;
				case game.board.PIECE_PAWN: //兵棋
					//如果已经过河，则判断是否左移一格，右移一格
					if(this.away_river(sqSrc) && (sqDst - sqSrc == 1 || sqDst - sqSrc == -1)){
						return true;
					}
					//如果没有过河，则只能前进一格
					return sqDst == this.isForward(sqSrc);
				default:
					return false;
			}
		}
	}
})()