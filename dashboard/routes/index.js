const express = require("express"),
	CheckAuth = require("../auth/CheckAuth"),
	router = express.Router();

router.get("/", CheckAuth, async (req, res) => {
	res.redirect("/selector");
});

router.get("/selector", CheckAuth, async(req, res) => {
	res.render("selector", {
		user: req.userInfos,
		translate: req.translate,
		currentURL: `/${req.originalUrl}`
	});
});

module.exports = router;