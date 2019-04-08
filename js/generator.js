/**
 * 获取所有可选的位置
 */
(function(){
	var Gen = window.Gen = function(){
		// 将、车、炮 移动数组,分别代表四个方向：上左右下
		this.KING_DELTA = [-16,-1,1,16];
		// 士、象 的移动，其中，象棋的移动，是士棋移动的两倍，因此可以用同一个数组表示
		this.ADVISOR_DELTA = [-17,-15,15,17];
		//马棋的移动
		this.KNIGHT_DELTA = [[-33,-31],[-18,14],[-14,18],[31,33]];
	}
	//获取所有可走的点
	Gen.prototype.generatorMoves = function(squares){
		var mvs = []; // 存储所有可走的点

		var pcSelfSide = P.side_tag(game.board.isPlayer); //本方棋子标志
		var pcOpSide = P.opp_side_tag(game.board.isPlayer); //对方棋子标志
		//查询所有的点
		for(var sqSrc=0;sqSrc < 256;sqSrc++){
			var pcSrc = squares[sqSrc];
			if((pcSrc & pcSelfSide) == 0){
				//该位置为对方棋子，或者没有棋子
				continue;
			}
			//根据棋子类型筛选
			switch(pcSrc - pcSelfSide){
				case game.board.PIECE_KING: // 将
					//四个方向
					for(var i=0;i<4;i++){
						var sqDst = sqSrc + this.KING_DELTA[i];
						//如果终点不在九宫上，或者终点位置棋子为本方棋子，则该点不合法
						if(!P.isIn_Fort(sqDst)){
							continue;
						}
						var pcDst = squares[sqDst];
						//终点位置为空，或者为对方棋子，合法
						if((pcDst & pcSelfSide) == 0){
							var mv = P.move(sqSrc,sqDst);
							mvs.push(mv);
						}
					}
					break;
				case game.board.PIECE_ADVISOR: //士
					//四个方向
					for(var i=0;i<4;i++){
						var sqDst = sqSrc + this.ADVISOR_DELTA[i];
						//如果终点不在九宫上，或者终点位置棋子为本方棋子，则该点不合法
						if(!P.isIn_Fort(sqDst)){
							continue;
						}
						var pcDst = squares[sqDst];
						//终点位置为空，或者为对方棋子，合法
						if((pcDst & pcSelfSide) == 0){
							var mv = P.move(sqSrc,sqDst);
							mvs.push(mv);
						}
					}
					break;
				case game.board.PIECE_BISHOP: //象
					for(var i=0;i<4;i++){
						var sqDst = sqSrc + (this.ADVISOR_DELTA[i] << 1);
						//象眼位置
						var sqPin = P.BISHOP_PIN(sqSrc,sqDst);
						//如果终点不在棋盘上，或者象眼位置有棋子，或者终点已过河，则不合法
						if(!(game.board.inBoard(sqDst) && P.SAME_HALF(sqSrc,sqDst) && squares[sqPin] == 0)){
							continue;
						}
						var pcDst = squares[sqDst];
						//终点位置为空，或者为对方棋子，合法
						if((pcDst & pcSelfSide) == 0){
							var mv = P.move(sqSrc,sqDst);
							mvs.push(mv);
						}
					}
					break;
				case game.board.PIECE_KNIGHT: //马
					for(var i=0;i<4;i++){
						//四个方向的马腿位置，即为将棋走子位置
						var sqPin = sqSrc + this.KING_DELTA[i];
						//马腿位置有棋子，则不考虑
						if(squares[sqPin] > 0){
							continue;
						}
						//每个马腿，对应两个位置
						for(var j=0;j<2;j++){
							var sqDst = sqSrc + this.KNIGHT_DELTA[i][j];
							//如果终点不在棋盘内
							if(!game.board.inBoard(sqDst)){
								continue;
							}
							var pcDst = squares[sqDst];
							//终点位置为空，或者为对方棋子，合法
							if((pcDst & pcSelfSide) == 0){
								var mv = P.move(sqSrc,sqDst);
								mvs.push(mv);
							}
						}
					}
					break;
				case game.board.PIECE_ROOK: //车
					//车的四个方向，和将的四个方向一致
					for(var i=0;i<4;i++){
						//尝试往这个方向走一步
						var delta = this.KING_DELTA[i];
						var sqDst = sqSrc + delta;
						while(game.board.inBoard(sqDst)){
							var pcDst = squares[sqDst];
							//如果终点为空，则记录该走法
							if(pcDst == 0){
								var mv = P.move(sqSrc,sqDst);
								mvs.push(mv);
							} else {
								//如果终点为对方棋子，那么记录走法后，不再允许继续在这个方向前进
								if((pcDst & pcOpSide) != 0){
									mvs.push(P.move(sqSrc,sqDst));
									break;
								}
								break;
							}
							sqDst += delta;
						}
					}
					break;
				case game.board.PIECE_CANNON: //炮
					for(var i=0;i<4;i++){
						var delta = this.KING_DELTA[i];
						var sqDst = sqSrc + delta;
						var isPassPiece = false; //判断是否翻山
						//炮有两种情况，一种是不隔棋子直走;另一种是隔着一个棋子，吃掉对方棋子
						while(game.board.inBoard(sqDst)){
							var pcDst = squares[sqDst];
							//如果没有翻山
							if(!isPassPiece){
								if(pcDst == 0){
									var mv = P.move(sqSrc,sqDst);
									mvs.push(mv);
								} else {
									isPassPiece = true;
								}
							} else {
								//如果遇到己方棋子，则这个方向结束查询
								if(pcDst > 0){
									if((pcDst & pcOpSide) != 0){
										//遇到的是对方棋子，则记录走法，结束这个方向的查询
										mvs.push(P.move(sqSrc,sqDst));
										break;
									}
									break;
								}
							}
							
							sqDst += delta;
						}
					}
					break;
				case game.board.PIECE_PAWN: //兵
					//兵棋前进一步的位置
					var sqDst = P.isForward(sqSrc);
					if(game.board.inBoard(sqDst)){
						var pcDst = squares[sqDst];
						if((pcDst & pcSelfSide) == 0){
							mvs.push(P.move(sqSrc,sqDst));
						}
					}
					//如果兵已经过河，则可以左右移动
					var delta = [-1,1];
					if(P.away_river(sqSrc)){
						for(var i=0;i<2;i++){
							sqDst = sqSrc + delta[i];
							//终点在棋盘上，则判断是否是对方棋子或空子
							if(game.board.inBoard(sqDst)){
								var pcDst = squares[sqDst];
								if((pcDst & pcSelfSide) == 0 ){
									mvs.push(P.move(sqSrc,sqDst));
								}
							}
						}
					}
					break;
			}
		}
		return mvs;
	}
})()