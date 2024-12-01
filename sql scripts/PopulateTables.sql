-- Insert sample data into the SPONSORS table
INSERT INTO SPONSORS (PT_VALUE, NAME, DESCRIPTION, CREATION_DATE)
VALUES 
(0.01, 'Malwart', 'Grocery and retail corporation', NOW()),
(0.01, 'Amazingon', 'Online shopping corporation', NOW()),
(0.01, 'PedEx', 'Shipping company', NOW()),
(0.01, 'UPZ', 'Shipping company', NOW());

-- Insert sample data into the ACCOUNTS table
INSERT INTO ACCOUNTS (NAME, ADDRESS, CREATION_DATE, STATUS, LAST_LOGIN, ACCOUNT_TYPE, NUM_POINTS, BIRTHDAY, USERNAME, EMAIL, BIO, PASSWORD, FAILED_ATTEMPTS, MFA_KEY)
VALUES
('John Doe', '123 Elm St, Springfield, IL', NOW(), 'active', NOW(), 'driver', 20, '1990-05-14', 'johndoe90', 'tngjoluke@gmail.com', 'Amazingon driver and tech enthusiast. Joff Bozos I love you', 'pbkdf2_sha256$600000$ChFXUKkuuF40WdqIm8bfRY$gqdi5ZQiYMPsGAp8yqU3TMl5F5gDxP9bNL4yjP3zwKU=', 0, NULL),
('Jane Smith', '456 Oak Ave, Metropolis, NY', NOW(), 'active', NOW(), 'sponsor', 0, '1985-11-30', 'janesmith85', 'janesmith85@email.com', 'Amazion worker for 10 years', 'pbkdf2_sha256$600000$bnd9285n0zmvj82er8l3n63mzo1ur9c8d2mfid89awu34hgbrfja129dd83j9438h$6UF1KSjOixSM/veb1AcEe20u5/BSV4/FJSA7qWBNvfs=', 0, NULL),
('Sam Wilson', '789 Pine Rd, Gotham, NJ', NOW(), 'active', NOW(), 'admin', 0, '1980-02-22', 'samwilson_admin', 'samwilson@email.com', 'Admin and PandaSoft employee', 'pbkdf2_sha256$600000$bnd9285n0zmvj82er8l3n63mzo1ur9c8d2mfid89awu34hgbrfja129dd83j9438h$DjCYDYDh7jKmpC4PId2HxLcqg0Up9VQUf2GZfIqGBgo=',0, NULL),
('Alex Brown', '101 Maple Blvd, Star City, CA', NOW(), 'deleted', NOW(), 'driver', 80, '1992-07-19', 'alexbrown92', 'alexbrown92@email.com', 'Former NASCAR driver. I love driving', '', 0, NULL);

INSERT INTO ACCOUNT_SPONSOR (ACCOUNT_ID, SPONSOR_ID, NUM_POINTS, STATUS, HIRING_DESC, REJECT_DESC, APP_DATE)
VALUES
(2,2,0,'accepted','sponsor for amazingon','',NOW()),
(1,2,30, 'accepted', 'i work hard for the money','',NOW());
-- ()
-- Insert sample data into the CATALOG table
INSERT INTO CATALOG(CAT_SPONSOR_ID, ITEM_ID)
VALUES
(1,1063466898),
(2,1688506685),
(3,1315255745),
(4,522395870);

-- Insert sample data into the APPLICATIONS table
-- INSERT INTO APPLICATIONS (APP_ACCOUNT_ID, APP_SPONSOR_ID, HIRING_DESC, APP_CREATE_DATE, APP_STATUS)
-- VALUES
-- (1, 2, 'Hard worker and been at Amazingon for 10 years', NOW(), 'OPEN'),
-- (4, 3, 'PedEx worker for 5 years, no infractions', NOW(), 'OPEN');

-- Insert sample data into the AUDIT table
INSERT INTO AUDIT (AUDIT_SPONSOR_ID, AUDIT_ACCOUNT_ID, EVENT_TYPE, DESCRIPTION)
VALUES
(2, 1, 'Login', 'User ID:1 logged in successfully'),
(2, 1, 'Account Update', 'User ID:1 updated account details'),
(3, 4, 'Points Added', 'User ID:3 added 100 points to ID:4'),
(3, 4, 'Account Deletion', 'User ID:3 deleted account ID:4');


-- -- Insert sample data into the POINT_HISTORY table
-- INSERT INTO POINT_HISTORY (POINT_CHANGE, POINT_CHANGE_DATE, STATUS, ITEM_ID, ACC_SPONSOR_ID)
-- VALUES
-- (50, NOW(), 'COMPLETED', 101, 1),
-- (-30, NOW(), 'IN_PROGRESS', 102, 1),
-- (100, NOW(), 'COMPLETED', 103, 4),
-- (-20, NOW(), 'CANCELLED', 104, 4);


