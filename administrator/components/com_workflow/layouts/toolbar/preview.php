<?php

/**
 * @package     Joomla.Administrator
 * @subpackage  com_workflow
 *
 * @copyright   (C) 2025 Open Source Matters, Inc. <https://www.joomla.org>
 * @license     GNU General Public License version 2 or later; see LICENSE.txt
 */

defined('_JEXEC') or die;

use Joomla\CMS\Factory;
use Joomla\CMS\Language\Text;

Factory::getDocument()->getWebAssetManager()
    ->useScript('webcomponent.toolbar-button');

$title = Text::_('COM_WORKFLOW_PREVIEW');
?>
<joomla-toolbar-button>
    <button class="btn btn-info" onclick="WorkflowGraph.Event.fire('onClickPreviewWorkflow')">
        <span class="icon-eye icon-fw" aria-hidden="true"></span>
        <?php echo $title; ?>
    </button>
</joomla-toolbar-button>
