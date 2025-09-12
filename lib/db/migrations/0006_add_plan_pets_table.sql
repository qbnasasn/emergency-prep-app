CREATE TABLE plan_pets (
    plan_id UUID NOT NULL,
    pet_id UUID NOT NULL,
    PRIMARY KEY (plan_id, pet_id),
    FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE,
    FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
);
