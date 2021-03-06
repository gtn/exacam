<?php
// This file is part of Exabis Quiz Camera
//
// (c) 2017 GTN - Global Training Network GmbH <office@gtn-solutions.com>
//
// Exabis Competence Grid is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This script is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You can find the GNU General Public License at <http://www.gnu.org/licenses/>.
//
// This copyright notice MUST APPEAR in all copies of the script!

$capabilities = array(
	/*
	'block/exacam:use' => array(
		'captype' => 'read', // needs to be read, else guest users can't access the library
		'contextlevel' => CONTEXT_SYSTEM,
		'legacy' => array(
			'user' => CAP_ALLOW,
		),
	),
	*/
	'block/exacam:addinstance' => array(
		'captype' => 'write',
		'contextlevel' => CONTEXT_BLOCK,
		'archetypes' => array(
			'editingteacher' => CAP_ALLOW,
			'manager' => CAP_ALLOW,
		),
		'clonepermissionsfrom' => 'moodle/site:manageblocks',
	),
	'block/exacam:myaddinstance' => array(
		'captype' => 'write',
		'contextlevel' => CONTEXT_SYSTEM,
		'archetypes' => array(
			'user' => CAP_PREVENT,
		),
		'clonepermissionsfrom' => 'moodle/my:manageblocks',
	),
);
