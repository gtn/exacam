<?php

require __DIR__.'/inc.php';

$courseid = required_param('courseid', PARAM_INT);

$course = $DB->get_record('course', array('id' => $courseid), '*', MUST_EXIST);
$context = context_course::instance($courseid);

require_login($course);

if (!block_dukcam_is_teacher()) {
	throw new moodle_exception('no teacher');
}

$PAGE->set_url('/blocks/dukcam/quizstart.php', array('courseid' => $courseid));
$PAGE->set_heading('');

echo $OUTPUT->header();

$quizzes = get_coursemodules_in_course('quiz', $courseid);

$userid = optional_param('userid', 0, PARAM_INT);
$quizid = optional_param('quizid', 0, PARAM_INT);

if ($userid && $quizid) {
	if (!isset($quizzes[$quizid])) {
		throw new \Exception('quiz not found');
	}

	$user = $DB->get_record('user', ['id' => $userid]);

	$quiz = $quizzes[$quizid];
	echo '<h2>Quiz '.$quiz->name.' / Benutzer '.fullname($user).'</h2>';

	$fs = get_file_storage();
	$files = $fs->get_area_files(context_module::instance($quiz->id)->id, 'block_dukcam', 'quizshot', $userid, 'timemodified DESC');

	echo '<div>';
	?>
	<style>
		.dukcam-img {
			float: left;
			padding: 5px;
			margin: 5px;
			border: 1px solid black;
		}
		.dukcam-img span {
			display: block;
			text-align: center;
			margin: 3px 0 -3px 0;
		}
	</style>
	<?php
	foreach ($files as $file) {

		$imageurl = moodle_url::make_pluginfile_url($file->get_contextid(), $file->get_component(), $file->get_filearea(), $file->get_itemid(), $file->get_filepath(), $file->get_filename());
		$img = html_writer::empty_tag('img', array('src' => $imageurl, 'class' => ''));
		echo '<div class="dukcam-img"><div>'.$img.'</div><span>'.userdate($file->get_timemodified()).'</span></div>';
	}
	echo '</div>';
} else {
	foreach ($quizzes as $quiz) {
		echo '<h2>Quiz '.$quiz->name.'</h2>';

		$users = $DB->get_records_sql("
			SELECT u.*
			FROM {user} u
			WHERE u.id IN (
				SELECT DISTINCT userid
				FROM {files}
				WHERE component='block_dukcam' AND filearea='quizshot' AND filename<>'.'
				AND contextid = ?
			)
		", [context_module::instance($quiz->id)->id]);

		foreach ($users as $user) {
			echo '<a href="'.$_SERVER['PHP_SELF'].'?courseid='.$courseid.'&quizid='.$quiz->id.'&userid='.$user->id.'">'.fullname($user).'</a><br/>';
		}
	}
}

echo $OUTPUT->footer();