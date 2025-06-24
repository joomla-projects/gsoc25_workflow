<?php

/**
 * @package     Joomla.Administrator
 * @subpackage  com_workflow
 *
 * @copyright   (C) 2025 Open Source Matters, Inc. <https://www.joomla.org>
 * @license     GNU General Public License version 2 or later; see LICENSE.txt
 * @since       DEPLOY_VERSION
 */

\defined('_JEXEC') or die;

/** @var Joomla\CMS\WebAsset\WebAssetManager $wa */
$wa = $this->getDocument()->getWebAssetManager();
$wa->useScript('keepalive');
$wa->useStyle('com_workflow.workflowgraph');


// Get the URI for the JavaScript module
$script = $wa->getAsset('script', name: 'com_workflow.workflowgraph')->getUri(true);
?>
<div id="workflow-graph-root"></div>
<script type="module" src="<?php echo $script ?>"></script>
