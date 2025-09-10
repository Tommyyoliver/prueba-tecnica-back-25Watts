CREATE TABLE coupon (
    id INT PRIMARY KEY AUTO_INCREMENT,
    description VARCHAR(255),
    value INT NOT NULL,
    expiration_date VARCHAR(255) NOT NULL,
    expired BOOLEAN,
    active BOOLEAN
);