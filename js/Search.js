/**
 * 搜索算法，提供走棋方式
 */
(function(){
	var Search = window.Search = function(){
		this.MAXDEPTH = 4;
	}
	Search.prototype.searchMove = function(squares){
		var alpha = -Infinity,beta = Infinity;
		var best = -Infinity;
		var arr = squares.concat();
		var mvs = game.gen.generatorMoves(squares);
		var value = 0;
		var bestMove = 0;

		for(var i=0;i<mvs.length;i++){
			if(!game.board.makeMove(mvs[i],arr))
				continue;
			var value = this.minSearch(arr,this.MAXDEPTH-1,alpha,beta);
			if(value > best){
				best = value;
				bestMove = mvs[i];
			}
			game.board.unmakeMove(arr,true);
		}
		return bestMove;
	}
	Search.prototype.maxSearch = function(squares,depth,alpha,beta){
		if(depth == 0){
			return evaluate(squares,1);
		}
		var best = -Infinity;
		var mvs = game.gen.generatorMoves(squares);
		var value = 0;
		var mv = 0;
		for(var i=0;i<mvs.length;i++){
			mv = mvs[i];
			if(!game.board.makeMove(mv,squares))
				continue;
			value = this.minSearch(squares,depth-1,alpha,best>beta?best:beta);
			game.board.unmakeMove(squares,true);
			if(value > best){
				best = value;
			}
			if(value > alpha){
				break;
			}
		}
		console.log("maxBest:" + best);
		return best;
	}
	Search.prototype.minSearch = function(squares,depth,alpha,beta){
		if(depth == 0){
			return evaluate(squares,1);
		}
		var best = Infinity;
		var mvs = game.gen.generatorMoves(squares);
		var value = 0;
		var mv = 0;
		for(var i=0;i<mvs.length;i++){
			mv = mvs[i];
			if(!game.board.makeMove(mv,squares))
				continue;
			value = this.maxSearch(squares,depth-1,best<alpha?best:alpha,beta);
			game.board.unmakeMove(squares,true);
			if(value < best){
				best = value;
			}
			if(value < beta){
				break;
			}
		}
		return best;
	}
})()