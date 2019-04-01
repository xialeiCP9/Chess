/**
 * 搜索算法，提供走棋方式
 */
(function(){
	var Search = window.Search = function(){

	}
	Search.prototype.searchMove = function(){
		var gen = new Gen();
		var mvs = gen.generatorMoves();
		console.log("mvs:",mvs);
		var mv = mvs[parseInt(Math.random() * mvs.length)];
		console.log("mv:"+ mv);
		return mv;
	}
})()