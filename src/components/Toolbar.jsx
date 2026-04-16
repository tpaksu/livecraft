import { useState } from '@wordpress/element';
import { Button, Dropdown, MenuGroup, MenuItem } from '@wordpress/components';
import {
	pencil,
	plus,
	page,
	post,
	cloud,
	close,
	undo,
	redo,
} from '@wordpress/icons';
import { __ } from '@wordpress/i18n';

function SaveIndicator( { status } ) {
	if ( status === 'idle' ) {
		return null;
	}

	const labels = {
		unsaved: __( 'Unsaved changes', 'wp-livecraft' ),
		saving: __( 'Saving…', 'wp-livecraft' ),
		saved: __( 'Saved', 'wp-livecraft' ),
		error: __( 'Save failed', 'wp-livecraft' ),
	};

	const className = `wp-livecraft-save-indicator wp-livecraft-save-indicator--${ status }`;

	return <span className={ className }>{ labels[ status ] || '' }</span>;
}

function NewContentDropdown( { busy, wrapAction, onNewContent } ) {
	return (
		<Dropdown
			className="wp-livecraft-toolbar__new-dropdown"
			contentClassName="wp-livecraft-toolbar__new-menu"
			popoverProps={ { placement: 'top-end' } }
			renderToggle={ ( { isOpen, onToggle } ) => (
				<Button
					className="wp-livecraft-toolbar__new"
					icon={ plus }
					onClick={ onToggle }
					aria-expanded={ isOpen }
					disabled={ busy }
					variant="secondary"
				>
					{ __( 'Create New', 'wp-livecraft' ) }
				</Button>
			) }
			renderContent={ ( { onClose: closeMenu } ) => (
				<MenuGroup className="wp-livecraft-toolbar__new-menu-group">
					<MenuItem
						icon={ post }
						disabled={ busy }
						onClick={ () => {
							closeMenu();
							wrapAction( () => onNewContent( 'post' ) )();
						} }
					>
						{ __( 'New Post', 'wp-livecraft' ) }
					</MenuItem>
					<MenuItem
						icon={ page }
						disabled={ busy }
						onClick={ () => {
							closeMenu();
							wrapAction( () => onNewContent( 'page' ) )();
						} }
					>
						{ __( 'New Page', 'wp-livecraft' ) }
					</MenuItem>
				</MenuGroup>
			) }
		/>
	);
}

export default function Toolbar( {
	editMode,
	saveStatus,
	postStatus,
	hasUndo,
	hasRedo,
	onToggleEditMode,
	onSave,
	onPublish,
	onSaveDraft,
	onUndo,
	onRedo,
	onExit,
	onNewContent,
} ) {
	const [ busy, setBusy ] = useState( false );

	const wrapAction = ( fn ) => async () => {
		setBusy( true );
		try {
			await fn();
		} finally {
			setBusy( false );
		}
	};

	const postType = window.wpLivecraft?.postType || 'post';
	const editLabel =
		postType === 'page'
			? __( 'Edit Page', 'wp-livecraft' )
			: __( 'Edit Post', 'wp-livecraft' );

	// Not in edit mode: show edit button and new content dropdown.
	if ( ! editMode ) {
		return (
			<div className="wp-livecraft-toolbar wp-livecraft-toolbar--idle">
				<Button
					className="wp-livecraft-toolbar__toggle"
					icon={ pencil }
					onClick={ onToggleEditMode }
					variant="secondary"
				>
					{ editLabel }
				</Button>

				<NewContentDropdown
					busy={ busy }
					wrapAction={ wrapAction }
					onNewContent={ onNewContent }
				/>
			</div>
		);
	}

	const isPublished = postStatus === 'publish';

	return (
		<div className="wp-livecraft-toolbar wp-livecraft-toolbar--editing">
			<SaveIndicator status={ saveStatus } />

			<Button
				className="wp-livecraft-toolbar__undo"
				icon={ undo }
				label={ __( 'Undo', 'wp-livecraft' ) }
				onClick={ onUndo }
				disabled={ ! hasUndo }
				variant="tertiary"
			/>
			<Button
				className="wp-livecraft-toolbar__redo"
				icon={ redo }
				label={ __( 'Redo', 'wp-livecraft' ) }
				onClick={ onRedo }
				disabled={ ! hasRedo }
				variant="tertiary"
			/>

			{ /* Save / Update button */ }
			<Button
				className="wp-livecraft-toolbar__save"
				icon={ cloud }
				onClick={ wrapAction( onSave ) }
				disabled={ busy || saveStatus === 'saving' }
				variant="secondary"
			>
				{ isPublished
					? __( 'Update', 'wp-livecraft' )
					: __( 'Save Draft', 'wp-livecraft' ) }
			</Button>

			{ /* Publish button (only for drafts/pending) */ }
			{ ! isPublished && (
				<Button
					className="wp-livecraft-toolbar__publish"
					onClick={ wrapAction( onPublish ) }
					disabled={ busy }
					variant="primary"
				>
					{ __( 'Publish', 'wp-livecraft' ) }
				</Button>
			) }

			{ /* Switch to draft (only for published posts) */ }
			{ isPublished && (
				<Button
					className="wp-livecraft-toolbar__draft"
					onClick={ wrapAction( onSaveDraft ) }
					disabled={ busy }
					variant="secondary"
				>
					{ __( 'Switch to Draft', 'wp-livecraft' ) }
				</Button>
			) }

			{ /* Exit edit mode */ }
			<Button
				className="wp-livecraft-toolbar__exit"
				icon={ close }
				label={ __( 'Exit editor', 'wp-livecraft' ) }
				onClick={ wrapAction( onExit ) }
				disabled={ busy }
				variant="tertiary"
			/>
		</div>
	);
}
