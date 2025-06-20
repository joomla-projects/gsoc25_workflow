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

$title = Text::_('COM_WORKFLOW_REDO');
?>
<joomla-toolbar-button>
    <button class="btn btn-info" onclick="WorkflowGraph.Event.fire('onClickRedoWorkflow')">
        <span class="icon-redo icon-fw" aria-hidden="true"></span>
        <?php echo $title; ?>
    </button>
</joomla-toolbar-button>
