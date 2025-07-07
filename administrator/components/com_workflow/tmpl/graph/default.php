<?php

/**
 * @package     Joomla.Administrator
 * @subpackage  com_workflow
 *
 * @copyright   (C) 2025 Open Source Matters, Inc. <https://www.joomla.org>
 * @license     GNU General Public License version 2 or later; see LICENSE.txt
 * @since       _DEPLOY_VERSION_
 */

\defined('_JEXEC') or die;

use Joomla\CMS\Factory;
use Joomla\CMS\HTML\HTMLHelper;
use Joomla\CMS\Language\Text;
use Joomla\CMS\Router\Route;


/** @var Joomla\CMS\WebAsset\WebAssetManager $wa */
$wa = $this->getDocument()->getWebAssetManager();
$wa->useScript('keepalive');
$wa->useScript('form.validate');
$wa->useScript('joomla.dialog-autocreate');
$wa->useStyle('com_workflow.workflowgraph');

// Populate the language
$this->loadTemplate('texts');

$app   = Factory::getApplication();
$user  = $app->getIdentity();
$input = $app->getInput();
// Get the URI for the JavaScript module
$script = $wa->getAsset('script', name: 'com_workflow.workflowgraph')->getUri(true);
?>

<div id="workflow-graph-root"></div>
<script type="module" src="<?php echo $script ?>"></script>
