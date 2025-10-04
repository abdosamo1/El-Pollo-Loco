class Character extends MovableObject {
    x = 50;
    y = 125;
    width = 150;
    height = 300;
    
    Images_Walk = [
        'img/2_character_pepe/2_walk/W-21.png',
        'img/2_character_pepe/2_walk/W-22.png',
        'img/2_character_pepe/2_walk/W-23.png',
        'img/2_character_pepe/2_walk/W-24.png',
        'img/2_character_pepe/2_walk/W-25.png',
        'img/2_character_pepe/2_walk/W-26.png'
    ]

    constructor() {
        super();
        this.loadImages('img/2_character_pepe/2_walk/W-21.png');  
    }

    jump() {

    }
}