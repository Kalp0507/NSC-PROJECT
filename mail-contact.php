<?php

	$to = "amrita27022002@gmail.com"; // this is your Email address
	$from  = $_POST['email']; // this is the sender's Email address
	$sender_name = $_POST['name'];
	$address = $_POST['address'];
	// $service = $_POST['service'];
	// $note = $_POST['note'];
	$company = $_POST['company-name'];
	$phone = $_POST['phone'];
	$country = $_POST['country'];
	$business = $_POST['business'];
	$inquiry = $_POST['inquiry'];

	$subject = "Form submission";

	// $message = $sender_name . " has send the contact message. His / Her contact Service is " . $service . " and his / her adress is "  . $address . ". He / she wrote the following... ". "\n\n" . $note;
	$message = $sender_name . " has send the contact message. His / Her contact number is " . $phone . " and his / her address is "  . $address . " and belongs to country " . $country . ". His/Her company's name is " . $company . " His/Her inquiry is... ". "\n\n" . $inquiry . " He / she wrote on their business details... ". "\n\n" . $business;

	$headers = 'From: ' . $from;
	mail($to, $subject, $message, $headers);

?>