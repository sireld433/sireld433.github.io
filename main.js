const characters = [
    {
        name: 'Character 1',
        className: 'character1',
        images: ['image/JL4.gif', 'image/JL5.gif', 'image/JL7.gif', 'image/JL6.gif', 'image/JL8.gif']
    },
    {
        name: 'Character 2',
        className: 'character2',
        images: ['image/R1.gif', 'image/R2.gif', 'image/R3.gif', 'image/R4.gif', 'image/R5.gif', 'image/R6.gif', 'image/R7.gif', 'image/R8.gif', 'image/R9.gif']
    },
    {
        name: 'Character 3',
        className: 'character3',
        images: ['image/RM1.gif', 'image/RM4.gif', 'image/RM5.gif', 'image/RM6.gif']
    },
    {
        name: 'Character 4',
        className: 'character4',
        images: ['image/K3.gif', 'image/K5.gif', 'image/K6.gif', 'image/K7.gif']
    },
    {
        name: 'Character 5',
        className: 'character5',
        images: ['image/AK1.gif','image/AK2.gif','image/AK3.gif','image/AK4.gif','image/AK5.gif','image/AK6.gif', 'image/AK7.gif']
    }
];

function getRandomCharacterImages(arr, num) {
    
    const availableCharacters = [...arr];
    const selectedImages = [];

    for (let i = 0; i < num; i++) {
        const randomIndex = Math.floor(Math.random() * availableCharacters.length);
        const character = availableCharacters[randomIndex];

        const randomImageIndex = Math.floor(Math.random() * character.images.length);
        selectedImages.push(character.images[randomImageIndex]);

        // Đánh dấu
        availableCharacters.splice(randomIndex, 1);
    }

    return selectedImages;
}

// Hiển thị ảnh 
function displayRandomImages() {
    const imageContainer = document.getElementById('character-images');
    imageContainer.innerHTML = ''; // Xóa ảnh

    const randomImages = getRandomCharacterImages(characters, 5); 

    randomImages.forEach((imgSrc) => {
        const imgElement = document.createElement('img');
        imgElement.src = imgSrc;
        imgElement.style.width = '50px'; 
        imgElement.style.height = '50px';
        imageContainer.appendChild(imgElement);
    });
}

window.onload = displayRandomImages;
