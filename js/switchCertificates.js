function manageCertificates() {
    const imageHolder = document.getElementById('certificates');
    const certificates = [
        'images/python_oop_certificate.jfif',
        'images/js_advanced_certificate.jfif',
        'images/js_applications_certificate.jfif',
        'images/python_web_basics_certificate.jfif',
        'images/python_basics_certificate.jfif',
        'images/python_fundamentals_certificate.jfif',
        'images/python_advanced_certificate.jfif',
        'images/python_web_framework_certificate.jpg',
    ];

    function switchCertificates() {
        const c = certificates.shift();
        const image = document.createElement('img')
        image.id = 'certificate';
        image.src = c;
        image.alt = 'Certificate image';
        image.className = 'fadeInRight';
        imageHolder.removeChild(imageHolder.children[0]);
        imageHolder.appendChild(image);
        certificates.push(c);
    }

    setInterval(function(){
        switchCertificates();
    }, 5000);
}
