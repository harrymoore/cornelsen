function execute(node)
{
    logger.info("setTitle rule script fired");

    var title = node.data["title"] || "";
    var materialNumber = node.data["materialNumber"] || "";
    if (title !== materialNumber) {
        node.data["title"] = materialNumber;
        node.save();
    }
}