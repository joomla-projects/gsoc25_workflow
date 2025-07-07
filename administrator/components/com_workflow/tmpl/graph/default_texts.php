<?php

/**
 * @package     Joomla.Administrator
 * @subpackage  com_workflow
 *
 * @copyright   (C) 2025 Open Source Matters, Inc. <https://www.joomla.org>
 * @license     GNU General Public License version 2 or later; see LICENSE.txt
 */

defined('_JEXEC') or die;

use Joomla\CMS\Language\Text;

$translationStrings = [
    'WORKFLOW_GRAPH_LOADING',
    'WORKFLOW_GRAPH_STATUS',
    'WORKFLOW_GRAPH_ENABLED',
    'WORKFLOW_GRAPH_DISABLED',
    'WORKFLOW_GRAPH_STAGE',
    'WORKFLOW_GRAPH_STAGES',
    'WORKFLOW_GRAPH_STAGE_COUNT',
    'WORKFLOW_GRAPH_TRANSITION',
    'WORKFLOW_GRAPH_TRANSITIONS',
    'WORKFLOW_GRAPH_TRANSITION_COUNT',
    'WORKFLOW_GRAPH_ADD_STAGE',
    'WORKFLOW_GRAPH_ADD_TRANSITION',
    'WORKFLOW_GRAPH_ENTER_TRANSITION_MODE',
    'WORKFLOW_GRAPH_EXIT_TRANSITION_MODE',
    'WORKFLOW_GRAPH_UP_TO_DATE',
    'WORKFLOW_GRAPH_UNSAVED_CHANGES',
    'WORKFLOW_GRAPH_DEFAULT'
];

foreach ($translationStrings as $string) {
    Text::script($string);
}
