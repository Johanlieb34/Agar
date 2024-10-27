document.getElementById("basicBtn").addEventListener("click", function() {
    var example = document.getElementById("basicExample");
    if (example.style.display === "none") {
        example.style.display = "block";
    } else {
        example.style.display = "none";
    }
});