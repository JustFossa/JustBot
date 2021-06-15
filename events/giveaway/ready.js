module.exports = async client => {
	const Giveaway = client.utils.giveway.model;
	const docs = await Giveaway.find({ complete: false });

	docs.forEach(doc => {
		client.utils.giveway.setTimeout(doc);
	});
};
